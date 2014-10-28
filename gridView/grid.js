(function($){
	function Grid(){
		this.thead = $('<thead>');
		this.tfoot = $('<tfoot>');
		this.tbody = $('<tbody>');
		this.orderTypes = {
			"date":this.dateSort,
			"text":this.textSort,
		};
		this.columns = {};
		this.filteredData = new Array;
		this.sortedFields = {};
		this.settings = {
			orderField:{},
			filterField: {},
			data: new Array(),
			header: {},
			dataSort:false,
			rowsFilterCallback: function(row,headerData){return row;},
			rowsHeaderCallback: function(row,headerData){return row;},
			rowsBodyCallback: function(row,dataItem,idItem){return row;},
			columnsBodyCallback: function(column,dataItem,idItemRow,idItem){return column;},
			columnsHeaderCallback: function(column,dataItem){return column;},
			columnsFilterCallback: function(column,dataItem){return column;},
			id: "customGridView",
			tableCss:{width:"100%"},
			tableClass:'',
		}
	
	}
	
	Grid.prototype.getTable = function(){
		return $('<table />').addClass('yui').addClass('tableItems '+this.settings.tableClass)
			.attr('gridId', this.settings.id)
			.css(this.settings.tableCss)
			.append($(this.thead),$(this.tbody),$(this.tfoot))	
	}
	Grid.prototype.init = function(data){
		$.extend(this.settings,data);
		this.setData(this.settings.data);
		this.setHeader(this.settings.header);
		this.setOrder(this.settings.orderField);
		this.setFilters(this.settings.filterField);
		this.prepareHeader();
		this.prepareFilter();
		this.prepareBody(true);
		this.bindEvents();
		return this.getTable();
	}
	
	Grid.prototype.escapeString  = function(text) {
		return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
	}
	
	Grid.prototype.filterFunction = function(searchString,elem){
		for(var i=0;i<this.settings.data.length;i++){
			var flagFind = true;
			for(var j in searchString){
				if(!this.settings.data[i][j].toString().toLowerCase().match(this.escapeString(searchString[j]).toLowerCase()))
					flagFind = false;
			}
			
			if(!flagFind){
				for(var k in this.filteredData){
					if(JSON.stringify(this.filteredData[k]) == JSON.stringify(this.settings.data[i])){
						delete this.filteredData[k];
						break;
					}
				}	
				//if(!!JSON.stringify(this.filteredData).match(JSON.stringify(this.settings.data[i]))){
				
				//	this.filteredData = JSON.parse(JSON.stringify(this.filteredData).replace(JSON.stringify(this.settings.data[i]),'').replace('[,','[').replace(',,',',').replace(',]',']'));
				//}

				continue;
			}else{
				if(!JSON.stringify(this.filteredData).match(JSON.stringify(this.settings.data[i])))
					this.filteredData.push(this.settings.data[i]);
			}
		}
		this.prepareBody(false,this.filteredData);
	}
	Grid.prototype.orderFunction = function(elem,type){
		if(!(!!this.orderTypes[type])) throw new Error("'"+type+"' order type doesn't exist");//debugger
		if($.type(this.sortedFields[elem]) == "undefined") this.sortedFields[elem] = 1;
		this.orderTypes[type].call(this,elem,this.sortedFields[elem]);
		this.prepareBody(false);
		this.sortedFields[elem] = this.sortedFields[elem]*-1;
	}
	Grid.prototype.textSort = function(elem,sortedFieldsIndex){
		this.settings.data.sort(function (a, b){
			return (a[elem] < b[elem]) ? -1*sortedFieldsIndex : (a[elem] > b[elem]) ? 1*sortedFieldsIndex : 0;
		});
	}
	Grid.prototype.dateSort = function(elem,sortedFieldsIndex){
		this.settings.data.sort(function (a, b){
			return (new Date(a[elem]) < new Date(b[elem])) ? -1*sortedFieldsIndex : (new Date(a[elem]) > new Date(b[elem])) ? 1*sortedFieldsIndex : 0;
		});	
	}
	Grid.prototype.dataSort = function(data){
		if(!(!!this.settings.dataSort)) return data;
		if($.type(this.settings.dataSort) != 'object' && $.type(this.settings.dataSort) != 'function') 
			throw new Error("DataSort must be object or function");
		if($.type(this.settings.dataSort) == 'function'){
			data.sort(this.settings.dataSort);
			return data;
		}
		if($.type(this.settings.dataSort.type) != 'string' || $.type(this.settings.dataSort.name) != 'string') 
			throw new Error("DataSort object must have type and name");
		var availableTypes = {'up':1,'down':-1};
		if(!availableTypes[this.settings.dataSort.type]) throw new Error("DataSort type must be up or down");
		
		if(!(!!data[0][this.settings.dataSort.name])) throw new Error("DataSort name must exist in data");
		var curType = availableTypes[this.settings.dataSort.type];
		var name = this.settings.dataSort.name;
		data.sort(function(a,b){
			if(a[name] > b[name]) return 1*curType;
			if(a[name] < b[name]) return -1*curType;
			return 0;
		})
		return data;		
	}
	Grid.prototype.bindEvents = function(){
		//$("#"+this.settings.id).find('order-on').off('click').on('click',this.orderFunction);
	}
	Grid.prototype.prepareBody = function(needSort,data){
		data = data || this.settings.data;
		if(needSort && this.settings.dataSort) data = this.dataSort(data);
		$(this.tbody).empty();
		var tr = $();
		for (var i=0;i<data.length;i++){
			var td = $();
			for (var j in data[i]){
				var tempTd = this.settings.columnsBodyCallback.call({},$("<td>").addClass('history-table-column').append(data[i][j])[0],data[i][j],i,j);
				if(!(!!tempTd)) throw new Error("You have to add return to columnsBodyCallback function");
				td.push(tempTd);
			}
			var trTemp = this.settings.rowsBodyCallback.call({},$("<tr>").addClass("ui-bar-d").css({"font-size":"small"}).append($(td))[0],data[i],i);
			if(!(!!trTemp)) throw new Error("You have to add return to rowsBodyCallback function");
			tr.push(trTemp);
		}
		$(this.tbody).append($(tr));
	}
	Grid.prototype.prepareFilter = function(){
		var filterKeys = Object.keys(this.settings.filterField);
		if(!filterKeys.length) return;
		if(filterKeys.length > this.columns.lenght) throw new Error("Amount Of filter columns cannot be more than data columns");
		var td = $();
		var grid = this;
		for(var i in this.columns){
			var content = this.settings.columnsFilterCallback.call({},$("<td>")[0],this.settings.filterField[this.columns[i]]);
			if(!(!!content)) throw new Error("You have to add return to columnsFilterCallback function");
			if(!!this.settings.filterField[this.columns[i]]) $(content).append($("<input filterGridId='"+this.columns[i]+"' class='search-filter-field' type='text' data-mini='true'>")
				.on('keyup',(function(elem,type){
					return function(){
						var searchElem = {};
						$(this).parent().siblings().andSelf().children('input[type="text"]').each(function(){
							searchElem[$(this).attr('filterGridId')] = $(this).val()
						})
						grid.filterFunction(searchElem,elem);
					}
				})(grid.columns[i],grid.settings.filterField[grid.columns[i]])));	
			td.push($(content)[0]);
		}
				
		var trTemp = this.settings.rowsFilterCallback.call({},$("<tr>").addClass("ui-bar-b").css({"font-size":"small"}).append($(td)),this.settings.header);
		if(!(!!trTemp)) throw new Error("You have to add return to rowsFilterCallback function");
		$(trTemp).appendTo($(this.thead));
	}
	Grid.prototype.prepareHeader = function(){
		var headerKeys = Object.keys(this.settings.header);
		if(!headerKeys.length) return;
		if(headerKeys.length > this.columns.length) throw new Error("Amount Of header columns cannot be more than data columns");
		var grid = this;
		
		var th = $();
		for(var i in this.columns){
			var content = this.settings.columnsHeaderCallback.call({},$("<th>").css({"font-size":"12px"})[0],this.settings.header[this.columns[i]]);
			if(!(!!content)) throw new Error("You have to add return to columnsHeaderCallback function");
			
			if(!!this.settings.header[this.columns[i]]) $(content).append(this.settings.header[this.columns[i]]);	
			if(!!this.settings.orderField[this.columns[i]])	$(content).addClass('order-on').on('click',(function(elem,type){
				return function(){
					grid.orderFunction(elem,type);
				}
			})(grid.columns[i],grid.settings.orderField[grid.columns[i]]));	
			th.push($(content)[0]);
		}

		var trTemp = this.settings.rowsHeaderCallback.call({},$("<tr>").addClass("ui-bar-b").css({"font-size":"small"}).append($(th))[0],this.settings.header);
		if(!(!!trTemp)) throw new Error("You have to add return to rowsHeaderCallback function");
		$(trTemp).appendTo($(this.thead));
		
		
	}
	Grid.prototype.setHeader = function(header){
		if($.type(header) != "object") throw new Error("Header must be object");
		this.settings.header = header;
	}
	Grid.prototype.setData = function(data){
		if($.type(data) != "array") throw new Error("Data must be array with objects");
		if(!data.length) throw new Error("Data must be filled");
		if($.type(data[0]) != 'object') throw new Error("Data must be array with objects");
		this.settings.data = data;
		this.columns = Object.keys(this.settings.data[0]);
	
	}
	Grid.prototype.setOrder = function(orderName){
		if($.type(orderName) != "object") throw new Error("Order names must be object");
		this.settings.orderField = orderName;
	}
	Grid.prototype.setFilters = function(filterNames){
		if($.type(filterNames) != "object") throw new Error("Filter names must be object");
		this.settings.filterField = filterNames;
	}

	
	$.fn.createGrid = function (options) {
		var grid = new Grid();
		if(!!options && $.type(options) == 'object'){ 
			if(!!options.needReturn) return grid.init(options);
			$(this).html(grid.init(options));
			return;
		}
        return grid;
    };

})($)