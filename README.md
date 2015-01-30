This is module which gets easier work with big report data.
You could customize it very flexible.
This module shows your data as grid and it could be used for building reports.

Features:
Flexible customization allow prepared your grid as you want.
You can add sorting or ordering for some fields, add callbacks for every element in the grid and make column with action icons.

There are options which you can use for settings:



var options = {
	tableCss:{width:"100%"},	/*add CSS for grid*/
	tableClass:'customName',	/*add class for grid*/
	data:data['report'][container],		/*add data into grid*/
	rowsFilterCallback:function(row,headerData){		/*Callback which call when row with filters will be generated */
		/*do something*/
		return row;
	},
	rowsHeaderCallback: function(row,headerData){		/*Callback which call when row with heading will be generated */
		/*do something*/
		return row;
	},
	rowsBodyCallback: function(row,dataItem,idItem){		/*Callback which call when row with data will be generated */
		/*do something*/
		return row;
	},
	columnsBodyCallback: function(column,dataItem,idItem,idItemRow){		/*Callback which call when column with data will be generated */
		$(column).click(function(){
			alert('Your position: row = '+idItemRow+' and columnId = '+idItem);
		});
		/*do something*/
		return column;
	},
	columnsHeaderCallback: function(column,dataItem){		/*Callback which call when column with heading will be generated */
		/*do something*/
		return column;
	},
	columnsFilterCallback: function(column,dataItem){		/*Callback which call when column with filter will be generated */
		/*do something*/
		return column;
	},
	icons:{													/*Icons will be added with classes:"btnAddImgCustom","btnDelImgCustom", and with relevant callbacks */
		'btnAddImgCustom':function(rowId){/*do something*/},
		'btnDelImgCustom':function(rowId){/*do something*/},
	},
	orderColumn: new Array('firstName_hsnf','lastName_hsnf','mid_hsnf','admitDiag_hsnf','medicaidId_hsnf','dateLastHospAdm_hsnf','daysLastHospAdm_hsnf','medicareId_hsnf','curAdmDate_hsnf','instName_hsnf','par_hsnf'),		/*Columns will be established in relevant order*/
	orderField:{											/*This option establish fields which will be have possibility ordering */
		"mid_hsnf": "text",
		"lastName_hsnf": "text",
		"firstName_hsnf": "text",
		"medicareId_hsnf": "text",
		"dateLastHospAdm_hsnf": "date",
	},
	filterField:{											/*This option establish fields which will be have possibility filtering */
		"mid_hsnf": "text",
		"lastName_hsnf": "text",
		"firstName_hsnf": "text",
		"medicareId_hsnf": "text",
		"dateLastHospAdm_hsnf": "date",
		"daysLastHospAdm_hsnf": "text",
		"admitDiag_hsnf": "text"
	},
	header: {												/*This option establish fields which will be have headline */
		"mid_hsnf": "Member ID",
		"lastName_hsnf": "Last Name",
		"firstName_hsnf": "First Name",
		"medicareId_hsnf": "Medicare ID",
		"dateLastHospAdm_hsnf": "Date of Last Hospital Admission",
		"daysLastHospAdm_hsnf": "# Days Since Last Hospital Admission",
		"admitDiag_hsnf": "Admit Diagnosis"
	},
	dataSort: {												/*This option establish default order in grid */
		type:'up',
		name:'firstName_hsnf',
	}
};