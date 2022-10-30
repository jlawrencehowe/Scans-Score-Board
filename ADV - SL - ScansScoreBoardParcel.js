/**
 * ADV - SL - ScansScordBoardParcel.js
 *
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 * Author: Jacob Howe
 * Company: Advantus
 * Date: 2022/06/08
 * Version: 1.0
 * Purpose: Dashboard to show scans
 * Request: 
 */


define(['N/https','N/record','N/search','N/runtime', 'N/format'],
    function(https,record,search,runtime, format) {
		
		

        function onRequest_entry(context) {
			
			/*var customrecord_adv_pick_jobSearchObj = search.create({
			   type: "customrecord_adv_pick_job",
			   filters:
				[
				  ["custrecord_adv_pick_job_planned_ship_dt","onorbefore","today"], 
				  "AND", 
				  ["custrecord_adv_pick_job_status","anyof","1","2"],
				  "AND", 
				  ["custrecord_adv_pick_job_location","anyof","1","9"], 
				  "AND", 
				  ["custrecord_adv_pick_job.custrecord_rfs_picktask_status","anyof","1","2","4","7"]
			   ],
			   columns:
			   [
				  search.createColumn({name: "name", label: "ID"}),
				  search.createColumn({name: "custrecord_adv_pick_job_status", label: "Pick Job Status"}),
				  search.createColumn({name: "custrecord_adv_pick_job_picker", label: "Picker"}),
				  search.createColumn({name: "custrecord_adv_pick_job_location", label: "Location"}),
				  search.createColumn({
					 name: "custrecord_adv_pick_job_planned_ship_dt",
					 sort: search.Sort.ASC,
					 label: "Planned Ship Date"
				  }),
				  search.createColumn({
					 name: "id",
					 join: "CUSTRECORD_ADV_PICK_JOB",
					 label: "ID"
				  }),
				  search.createColumn({
					 name: "custrecord_rfs_adv_picktask_so",
					 join: "CUSTRECORD_ADV_PICK_JOB",
					 label: "Pick Task Sales Order"
				  }),
			   ]
			});*/
			//var searchResultCount = customrecord_adv_pick_jobSearchObj.runPaged().count;
			
			var pickJobs = [];
			var pickJobsArray = [];
			var pickTasks = {};
			var pickers = [];
			var shipDate = [];
			var salesOrders = [];
			var salesOrdersIDs = [];
			var pickStatus = [];
			var custName = [];
			
			/*customrecord_adv_pick_jobSearchObj.run().each(function(result) {
				
				for(var i = 0; i < pickJobs.length; i++){
					var doesContain = false;
					if(pickJobs[i] == result.getValue({name: 'name'})){
						doesContain = true;
						break;
					}
				}
				
				if(!doesContain){
					pickJobs.push(result.getValue({name: 'name'}));
					shipDate.push(result.getValue({name: 'custrecord_adv_pick_job_planned_ship_dt'}));
					pickTasks[result.getValue({name: 'name'})] = result.getValue({name: 'id', join: 'CUSTRECORD_ADV_PICK_JOB'});
					pickers.push(result.getText({name: 'custrecord_adv_pick_job_picker'}));
					salesOrders.push(result.getText({name: 'custrecord_rfs_adv_picktask_so', join: 'CUSTRECORD_ADV_PICK_JOB'}));
					salesOrdersIDs.push(result.getValue({name: 'custrecord_rfs_adv_picktask_so', join: 'CUSTRECORD_ADV_PICK_JOB'}));
					pickStatus.push(result.getText({name: 'custrecord_rfs_picktask_status', join: 'CUSTRECORD_ADV_PICK_JOB'}));
				}
				else{
					
						pickTasks[result.getValue({name: 'name'})] += ', ' + result.getValue({name: 'id', join: 'CUSTRECORD_ADV_PICK_JOB'});
				}
				
				return true;
				
			});*/
			var counter = 0;
			var scansSearch = PickTaskSearch([1, 9]);
			var palletJobsDone = {}
			var palletJobsRem = {};
			
			scansSearch.run().each(function(result) {
				
				var myLine = JSON.parse(JSON.stringify(result));
				//log.audit('test', myLine);
				for(var i = 0; i < salesOrders.length; i++){
					var doesContain = false;
					if(salesOrders[i] == myLine.values['MAX(custrecord_rfs_ptl_orderid)']){
						doesContain = true;
						break;
					}
				}
				
				
				if(parseInt(myLine.values['SUM(formulanumeric)_1']) == 0){
					
				}
				else{
					
					if(!doesContain){
					
					pickJobs.push(myLine.values['GROUP(custrecord_adv_picktaskline_pickjob)'][0].text);
					if(myLine.values['GROUP(custrecord_adv_picktaskline_pickjob)'][0].text != '- None -'){
						pickJobsArray.push(myLine.values['GROUP(custrecord_adv_picktaskline_pickjob)'][0].text);
					}
					shipDate.push(myLine.values['GROUP(CUSTRECORD_RFS_PTL_ORDERID.custbody_adv_planned_shipdate)']);
					pickTasks[myLine.values['MAX(custrecord_rfs_ptl_orderid)']] = myLine.values['GROUP(custrecord_rfs_ptl_parent)'][0].text;
					if(!!myLine.values['GROUP(custrecord_rfs_ptl_parent.custrecord_adv_pick_job)'][0].value){
						var fieldLookUp = search.lookupFields({
							type: 'customrecord_adv_pick_job',
							id: myLine.values['GROUP(custrecord_rfs_ptl_parent.custrecord_adv_pick_job)'][0].value,
							columns: ['custrecord_adv_pick_job_picker']
						});
						
						if(fieldLookUp.custrecord_adv_pick_job_picker != ''){
							pickers.push(fieldLookUp.custrecord_adv_pick_job_picker[0].text);
						}
						else{
							pickers.push(myLine.values['GROUP(CUSTRECORD_RFS_PTL_PARENT.custrecord_rfs_picktask_employee_act)'][0].text);
						}
					}
					else{
						pickers.push(myLine.values['GROUP(CUSTRECORD_RFS_PTL_PARENT.custrecord_rfs_picktask_employee_act)'][0].text);
					}
					salesOrders.push(myLine.values['MAX(custrecord_rfs_ptl_orderid)']);
					salesOrdersIDs.push(myLine.values['MAX(CUSTRECORD_RFS_PTL_ORDERID.internalid)']);
					pickStatus.push();
					palletJobsRem[myLine.values['MAX(custrecord_rfs_ptl_orderid)']] = myLine.values['SUM(formulanumeric)_1'];
					custName.push(myLine.values['GROUP(CUSTRECORD_RFS_PTL_ORDERID.custbody_adv_if_entityid)']);
					}
					else{
						//log.audit('test',myLine.values['GROUP(custrecord_adv_picktaskline_pickjob)'][0].text);
						pickTasks[myLine.values['GROUP(custrecord_adv_picktaskline_pickjob)'][0].text] += ', ' + myLine.values['GROUP(custrecord_rfs_ptl_parent)'][0].text;
						//palletJobsDone[myLine.values['GROUP(custrecord_adv_picktaskline_pickjob)'][0].text] = parseFloat(palletJobsDone[myLine.values['GROUP(custrecord_adv_picktaskline_pickjob)'][0].text]) + parseFloat(myLine.values['SUM(formulanumeric)']);
						palletJobsRem[myLine.values['MAX(custrecord_rfs_ptl_orderid)']] = parseFloat(palletJobsRem[myLine.values['MAX(custrecord_rfs_ptl_orderid)']]) + parseFloat(myLine.values['SUM(formulanumeric)_1']);
					}
					
				}
				return true;
			});
			
			if(salesOrders.length == -1){
				var completedScans = CompletedScansSearch([1, 9], pickJobsArray);
				
				completedScans.run().each(function(result) {
					var myLine = JSON.parse(JSON.stringify(result));
					if(palletJobsDone[myLine.values['GROUP(custrecord_adv_picktaskline_pickjob)'][0].text]){
						palletJobsDone[myLine.values['GROUP(custrecord_adv_picktaskline_pickjob)'][0].text] = parseFloat(palletJobsDone[myLine.values['GROUP(custrecord_adv_picktaskline_pickjob)'][0].text]) + parseFloat(myLine.values['SUM(formulanumeric)']);
					}
					else{
						if(myLine.values['SUM(formulanumeric)']){
						palletJobsDone[myLine.values['GROUP(custrecord_adv_picktaskline_pickjob)'][0].text] = parseFloat(myLine.values['SUM(formulanumeric)']);
						}
						else{
							palletJobsDone[myLine.values['GROUP(custrecord_adv_picktaskline_pickjob)'][0].text] = 0;
						}
					}
					return true;
				});
			}
			var colorSwap = false;
			
			
				
			var htmlText = '<html><head><meta http-equiv="refresh" content="' + 30 + ';URL= '+ "'https://5050497.extforms.netsuite.com/app/site/hosting/scriptlet.nl?script=7959&deploy=1&compid=5050497&h=8ca2272872b16044ecd8"+'" /><title>Pick Task Scoreboard, Parcel- 12th + E-Com</title></head><body style="background-color:#c2d6d6;"> ' +
			'<div class="container" >' +
				'<table cellpadding="2" cellspacing="0" width="100%" margin="5px"><tr><td><img src="https://5050497.secure.netsuite.com/core/media/media.nl?id=11&amp;c=5050497&amp;h=6de210e8f3406fb5dc3f" width="300" height="45"  /></td></tr></table>' +
				'<table cellpadding="5" cellspacing="0" width="100%" height="10%" align="center"><tr><td align="center"><p style="font-size:50px">Pick Task Scoreboard, Parcel- 12th + E-Com</p></td></tr></table>' +
				'<table cellpadding="0" cellspacing="0" width="100%" align="center" vertical-align="middle" style="border: 3px solid black;">' +
					'<tbody>' +
						'<tr>' +
						'	<td align="center" width="8%" style="background-color:#ffffff; border-right: 3px solid black; border-bottom: 3px solid black;">' +
						'		<p style="font-size:35px">Pick Job</p>' +
							'</td>' +
						'	<td align="center" width="15%" style="background-color:#ffffff; border-bottom: 3px solid black; border-right: 3px solid black;">' +
						'		<p style="font-size:30px">Pick Tasks</p>'+
							'</td>' +
						'	<td align="center" width="15%" style="background-color:#ffffff; border-bottom: 3px solid black; border-right: 3px solid black;">' +
						'		<p style="font-size:25px">Sales Order</p>'+
							'</td>' +
						'	<td align="center" width="12%" style="background-color:#ffffff; border-bottom: 3px solid black; border-right: 3px solid black;">' +
						'		<p style="font-size:30px">Picker</p>'+
							'</td>' +
						'	<td align="center" width="10%" style="background-color:#ffffff; border-bottom: 3px solid black; border-right: 3px solid black;">' +
						'		<p style="font-size:25px">Planned Ship Date</p>'+
							'</td>' +
						'	<td align="center" width="15%" style="background-color:#ffffff; border-bottom: 3px solid black; border-right: 3px solid black;">' +
						'		<p style="font-size:25px">Customer</p>'+
							'</td>' +
						'	<td align="center" width="12%" style="background-color:#ffffff; border-bottom: 3px solid black; border-right: 3px solid black;">' +
						'		<p style="font-size:30px">Pick Tasks Completed</p>'+
							'</td>' +
						'	<td align="center" width="20%" style="background-color:#ffffff; border-bottom: 3px solid black; border-right: 3px solid black;">' +
						'		<p style="font-size:25px">Pick Tasks Remaining</p>'+
							'</td>' +
						
						'</tr>';
						
						for(var i = 0; i < pickJobs.length; i++){
							var backgroundColor = '#baed91';
							if(colorSwap){
								backgroundColor = '#93e6e6';
								colorSwap = false;
							}
							else{
								colorSwap = true;
							}
							if(pickJobs[i] == '- None -'){
								htmlText += '<tr><td align="center"  style="background-color:' + backgroundColor + 
								';border-right: 3px solid black;";><p style="font-size:35px; ">'+ pickJobs[i] + '</p></td>';
								
							}else{
								htmlText += '<tr><td align="center"  style="background-color:' + backgroundColor + 
								';border-right: 3px solid black;";><p style="font-size:35px; "><a style="color: black;" href="https://5050497.app.netsuite.com/app/common/custom/custrecordentry.nl?rectype=1519&id=' + pickJobs[i] +'">' + pickJobs[i] + '</a></p></td>';
								
							}
							htmlText += '<td align="center"  style="background-color:' + backgroundColor + 
								';border-right: 3px solid black;";><p style="font-size:25px; ">';
							var splitTasks = pickTasks[salesOrders[i]].split(',');
							//log.audit('splitTasks', splitTasks);
							for(var x = 0; x < splitTasks.length; x++){
								if(x == splitTasks.length - 1){
									htmlText +='<a style="color: black;" href="https://5050497.app.netsuite.com/app/common/custom/custrecordentry.nl?rectype=940&id=' + splitTasks[x].trim() +'">' + splitTasks[x].trim() + '</a> ';
								}
								else{
									htmlText +='<a style="color: black;" href="https://5050497.app.netsuite.com/app/common/custom/custrecordentry.nl?rectype=940&id=' + splitTasks[x].trim() +'">' + splitTasks[x].trim() + '</a>, ';
								}
							}
							
								htmlText += '</p></td>';
							
							
							
								//htmlText += '<td align="center"  style="background-color:' + backgroundColor + 
								//';border-right: 3px solid black;";><p style="font-size:25px; "><a style="color: black;" href="https://5050497.app.netsuite.com/app/common/custom/custrecordentry.nl?rectype=940&id=' + pickTasks[pickJobs[i]] +'">' + pickTasks[pickJobs[i]] + '</a></p></td>';
								htmlText += '<td align="center"  style="background-color:' + backgroundColor + 
								';border-right: 3px solid black;";><p style="font-size:25px; "><a style="color: black;" href="https://5050497.app.netsuite.com/app/accounting/transactions/salesord.nl?id=' + salesOrdersIDs[i] +'">' + salesOrders[i] + '</a></p></td>';
								htmlText += '<td align="center"  style="background-color:' + backgroundColor + 
								';border-right: 3px solid black;";><p style="font-size:30px; ">' + pickers[i] + '</p></td>';
								htmlText += '<td align="center"   style="background-color:' + backgroundColor + 
								';border-right: 3px solid black;";><p style="font-size:25px; ">' + shipDate[i] + '</p></td>';
								htmlText += '<td align="center"   style="background-color:' + backgroundColor + 
								';border-right: 3px solid black;";><p style="font-size:25px; ">' + custName[i] + '</p></td>';
								if(palletJobsDone[salesOrders[i]]){
									htmlText += '<td align="center"  style="background-color:' + backgroundColor + 
									';border-right: 3px solid black;";><p style="font-size:30px; ">' + palletJobsDone[salesOrders[i]] + '</p></td>';
								}
								else{
									htmlText += '<td align="center"  style="background-color:' + backgroundColor + 
									';border-right: 3px solid black;";><p style="font-size:30px; ">' + 0 + '</p></td>';
								}
								htmlText += '<td align="center"   style="background-color:' + backgroundColor + 
								';border-right: 3px solid black;";><p style="font-size:25px; ">' + palletJobsRem[salesOrders[i]] + '</p></td>';
						
						
						
								htmlText += '</tr>';
						}
						
						
					var currentDate = new Date();
					currentDate = new Date(currentDate.getTime() + (3 * 60 * 60 * 1000));
				
					htmlText +='</tbody></table>' +
					'</div>' +
					'Reset time: 30 seconds | Monitor 3 | Last Update:'+ (parseInt(currentDate.getMonth()) + 1) + '/' + currentDate.getDate() + '/' + currentDate.getFullYear()  + ' ' + currentDate.getHours() + ':' + currentDate.getMinutes()
			'</body></html>';
			context.response.write(htmlText);
			
		}
		
		//Search using the location to grab all pick task searches
		function PickTaskSearch(locationId){
			
			return search.create({
			   type: "customrecord_rfs_picktask_line",
			   filters:
			   [
				  ["custrecord_rfs_ptl_orderid.custbody_adv_planned_shipdate","onorbefore","today"],"AND",["custrecord_rfs_ptl_status","anyof","1"],
				  "AND", 
				  ["custrecord_rfs_ptl_orderid.mainline","is","T"], 
				  "AND", 
				  ["custrecord_rfs_ptl_orderid.location","anyof", locationId], 
			   ],
			   columns:
			   [
				  search.createColumn({
					 name: "custrecord_rfs_ptl_parent",
					 summary: "GROUP",
					 label: "Pick Task"
				  }),
				  search.createColumn({
					 name: "custrecord_rfs_ptl_orderid",
					 summary: "MAX",
					 label: "Order Id"
				  }),
				  search.createColumn({
					 name: "otherrefnum",
					 join: "CUSTRECORD_RFS_PTL_ORDERID",
					 summary: "MAX",
					 label: "PO/Check Number"
				  }),
				   search.createColumn({
					 name: "internalid",
					 join: "CUSTRECORD_RFS_PTL_ORDERID",
					 summary: "MAX",
					 label: "Internal ID"
				  }),
				  search.createColumn({
					 name: "custrecord_adv_picktaskline_pickjob",
					 summary: "GROUP",
					 label: "Pick Job"
				  }),
				  search.createColumn({
					 name: "custrecord_adv_pick_job",
					 join: "custrecord_rfs_ptl_parent",
					 summary: "GROUP",
					 label: "Pick Job ID"
				  }),
				  search.createColumn({
					 name: "custbody_adv_planned_shipdate",
					 join: "CUSTRECORD_RFS_PTL_ORDERID",
					 summary: "GROUP",
					 sort: search.Sort.ASC,
					 label: "Planned Ship Date"
				  }),
				  search.createColumn({
					 name: "custrecord_rfs_picktask_employee_act",
					 join: "CUSTRECORD_RFS_PTL_PARENT",
					 summary: "GROUP",
					 label: "Employee Actual"
				  }),
				  search.createColumn({
					 name: "custbody_adv_if_entityid",
					 join: "CUSTRECORD_RFS_PTL_ORDERID",
					 summary: "GROUP",
					 label: "Customer Vendor Number"
				  }),
				  search.createColumn({
					 name: "formulanumeric",
					 summary: "SUM",
					 formula: "CASE WHEN  ({custrecord_rfs_ptl_parent.custrecord_rfs_picktask_picktolp} = 'F') THEN (CASE WHEN {custrecord_rfs_ptl_item.shipindividually} = 'T' THEN {custrecord_rfs_ptl_pick_quantity} WHEN {custrecord_rfs_ptl_pick_quantity} < NVL({custrecord_rfs_ptl_item.custitem_adv_innerctnqty_primary},{custrecord_rfs_ptl_item.custitem_adv_masterctnqty_primary}) THEN {custrecord_rfs_ptl_pick_quantity} WHEN {custrecord_rfs_ptl_item.custitem_adv_importctnqty_primary}<{custrecord_rfs_ptl_item.custitem_adv_masterctnqty_primary} THEN  FLOOR({custrecord_rfs_ptl_pick_quantity}/{custrecord_rfs_ptl_item.custitem_adv_masterctnqty_primary})+nvl((CASE WHEN {custrecord_rfs_ptl_item.custitem_adv_innerctnqty_primary}>0 THEN FLOOR( ({custrecord_rfs_ptl_pick_quantity}-((CASE WHEN {custrecord_rfs_ptl_item.custitem_adv_importctnqty_primary}>0 THEN FLOOR({custrecord_rfs_ptl_pick_quantity}/{custrecord_rfs_ptl_item.custitem_adv_importctnqty_primary}) ELSE 0 END)*NVL({custrecord_rfs_ptl_item.custitem_adv_importctnqty_primary},0))- ((CASE WHEN {custrecord_rfs_ptl_item.custitem_adv_masterctnqty_primary}>0 THEN FLOOR( ({custrecord_rfs_ptl_pick_quantity}-(( CASE WHEN {custrecord_rfs_ptl_item.custitem_adv_importctnqty_primary}>0 THEN FLOOR({custrecord_rfs_ptl_pick_quantity}/{custrecord_rfs_ptl_item.custitem_adv_importctnqty_primary}) ELSE 0 END)*NVL({custrecord_rfs_ptl_item.custitem_adv_importctnqty_primary},0)))/{custrecord_rfs_ptl_item.custitem_adv_masterctnqty_primary}) ELSE 0 END)*NVL({custrecord_rfs_ptl_item.custitem_adv_masterctnqty_primary},0)) )/ {custrecord_rfs_ptl_item.custitem_adv_innerctnqty_primary}) ELSE 0 END ),0)  ELSE  nvl(((CASE WHEN {custrecord_rfs_ptl_item.custitem_adv_importctnqty_primary}>0 THEN FLOOR({custrecord_rfs_ptl_pick_quantity}/{custrecord_rfs_ptl_item.custitem_adv_importctnqty_primary}) ELSE 0 END )*nvl({custrecord_rfs_ptl_item.custitem_adv_importctnqty_primary},0))/ {custrecord_rfs_ptl_item.custitem_adv_masterctnqty_primary},0)+nvl((CASE WHEN {custrecord_rfs_ptl_item.custitem_adv_masterctnqty_primary}>0 THEN FLOOR( ({custrecord_rfs_ptl_pick_quantity}-(( CASE WHEN {custrecord_rfs_ptl_item.custitem_adv_importctnqty_primary}>0 THEN FLOOR({custrecord_rfs_ptl_pick_quantity}/{custrecord_rfs_ptl_item.custitem_adv_importctnqty_primary}) ELSE 0 END)*NVL({custrecord_rfs_ptl_item.custitem_adv_importctnqty_primary},0)))/{custrecord_rfs_ptl_item.custitem_adv_masterctnqty_primary}) ELSE 0 END ),0)+nvl((CASE WHEN {custrecord_rfs_ptl_item.custitem_adv_innerctnqty_primary}>0 THEN FLOOR( ({custrecord_rfs_ptl_pick_quantity}-((CASE WHEN {custrecord_rfs_ptl_item.custitem_adv_importctnqty_primary}>0 THEN FLOOR({custrecord_rfs_ptl_pick_quantity}/{custrecord_rfs_ptl_item.custitem_adv_importctnqty_primary}) ELSE 0 END)*NVL({custrecord_rfs_ptl_item.custitem_adv_importctnqty_primary},0))- ((CASE WHEN {custrecord_rfs_ptl_item.custitem_adv_masterctnqty_primary}>0 THEN FLOOR( ({custrecord_rfs_ptl_pick_quantity}-(( CASE WHEN {custrecord_rfs_ptl_item.custitem_adv_importctnqty_primary}>0 THEN FLOOR({custrecord_rfs_ptl_pick_quantity}/{custrecord_rfs_ptl_item.custitem_adv_importctnqty_primary}) ELSE 0 END)*NVL({custrecord_rfs_ptl_item.custitem_adv_importctnqty_primary},0)))/{custrecord_rfs_ptl_item.custitem_adv_masterctnqty_primary}) ELSE 0 END)*NVL({custrecord_rfs_ptl_item.custitem_adv_masterctnqty_primary},0)) )/ {custrecord_rfs_ptl_item.custitem_adv_innerctnqty_primary}) ELSE 0 END ),0)  END) ELSE 0 END",
					 label: "Parcel Done"
				  }),
				  search.createColumn({
					 name: "formulanumeric",
					 summary: "SUM",
					 formula: "CASE WHEN  (({custrecord_rfs_ptl_parent.custrecord_rfs_picktask_picktolp} = 'F') AND {custrecord_rfs_ptl_status} = 'Planned') THEN (CASE WHEN {custrecord_rfs_ptl_item.shipindividually} = 'T' THEN {custrecord_rfs_ptl_pick_quantity} WHEN {custrecord_rfs_ptl_pick_quantity} < NVL({custrecord_rfs_ptl_item.custitem_adv_innerctnqty_primary},{custrecord_rfs_ptl_item.custitem_adv_masterctnqty_primary}) THEN {custrecord_rfs_ptl_pick_quantity} WHEN {custrecord_rfs_ptl_item.custitem_adv_importctnqty_primary}<{custrecord_rfs_ptl_item.custitem_adv_masterctnqty_primary} THEN  FLOOR({custrecord_rfs_ptl_pick_quantity}/{custrecord_rfs_ptl_item.custitem_adv_masterctnqty_primary})+nvl((CASE WHEN {custrecord_rfs_ptl_item.custitem_adv_innerctnqty_primary}>0 THEN FLOOR( ({custrecord_rfs_ptl_pick_quantity}-((CASE WHEN {custrecord_rfs_ptl_item.custitem_adv_importctnqty_primary}>0 THEN FLOOR({custrecord_rfs_ptl_pick_quantity}/{custrecord_rfs_ptl_item.custitem_adv_importctnqty_primary}) ELSE 0 END)*NVL({custrecord_rfs_ptl_item.custitem_adv_importctnqty_primary},0))- ((CASE WHEN {custrecord_rfs_ptl_item.custitem_adv_masterctnqty_primary}>0 THEN FLOOR( ({custrecord_rfs_ptl_pick_quantity}-(( CASE WHEN {custrecord_rfs_ptl_item.custitem_adv_importctnqty_primary}>0 THEN FLOOR({custrecord_rfs_ptl_pick_quantity}/{custrecord_rfs_ptl_item.custitem_adv_importctnqty_primary}) ELSE 0 END)*NVL({custrecord_rfs_ptl_item.custitem_adv_importctnqty_primary},0)))/{custrecord_rfs_ptl_item.custitem_adv_masterctnqty_primary}) ELSE 0 END)*NVL({custrecord_rfs_ptl_item.custitem_adv_masterctnqty_primary},0)) )/ {custrecord_rfs_ptl_item.custitem_adv_innerctnqty_primary}) ELSE 0 END ),0)  ELSE  nvl(((CASE WHEN {custrecord_rfs_ptl_item.custitem_adv_importctnqty_primary}>0 THEN FLOOR({custrecord_rfs_ptl_pick_quantity}/{custrecord_rfs_ptl_item.custitem_adv_importctnqty_primary}) ELSE 0 END )*nvl({custrecord_rfs_ptl_item.custitem_adv_importctnqty_primary},0))/ {custrecord_rfs_ptl_item.custitem_adv_masterctnqty_primary},0)+nvl((CASE WHEN {custrecord_rfs_ptl_item.custitem_adv_masterctnqty_primary}>0 THEN FLOOR( ({custrecord_rfs_ptl_pick_quantity}-(( CASE WHEN {custrecord_rfs_ptl_item.custitem_adv_importctnqty_primary}>0 THEN FLOOR({custrecord_rfs_ptl_pick_quantity}/{custrecord_rfs_ptl_item.custitem_adv_importctnqty_primary}) ELSE 0 END)*NVL({custrecord_rfs_ptl_item.custitem_adv_importctnqty_primary},0)))/{custrecord_rfs_ptl_item.custitem_adv_masterctnqty_primary}) ELSE 0 END ),0)+nvl((CASE WHEN {custrecord_rfs_ptl_item.custitem_adv_innerctnqty_primary}>0 THEN FLOOR( ({custrecord_rfs_ptl_pick_quantity}-((CASE WHEN {custrecord_rfs_ptl_item.custitem_adv_importctnqty_primary}>0 THEN FLOOR({custrecord_rfs_ptl_pick_quantity}/{custrecord_rfs_ptl_item.custitem_adv_importctnqty_primary}) ELSE 0 END)*NVL({custrecord_rfs_ptl_item.custitem_adv_importctnqty_primary},0))- ((CASE WHEN {custrecord_rfs_ptl_item.custitem_adv_masterctnqty_primary}>0 THEN FLOOR( ({custrecord_rfs_ptl_pick_quantity}-(( CASE WHEN {custrecord_rfs_ptl_item.custitem_adv_importctnqty_primary}>0 THEN FLOOR({custrecord_rfs_ptl_pick_quantity}/{custrecord_rfs_ptl_item.custitem_adv_importctnqty_primary}) ELSE 0 END)*NVL({custrecord_rfs_ptl_item.custitem_adv_importctnqty_primary},0)))/{custrecord_rfs_ptl_item.custitem_adv_masterctnqty_primary}) ELSE 0 END)*NVL({custrecord_rfs_ptl_item.custitem_adv_masterctnqty_primary},0)) )/ {custrecord_rfs_ptl_item.custitem_adv_innerctnqty_primary}) ELSE 0 END ),0)  END) ELSE 0 END",
					 label: "Parcel Remaining"
				  }),
				  
				 
			   ]
			});
			
		}
		
		//Search using the location to grab all pick task searches
		function CompletedScansSearch(locationId, pickJobs){
			
			return search.create({
			   type: "customrecord_rfs_picktask_line",
			   filters:
			   [
				  ["custrecord_rfs_ptl_orderid.custbody_adv_planned_shipdate","onorbefore","today"],"AND",["custrecord_rfs_ptl_status","anyof","2","3"],
				  "AND", 
				  ["custrecord_rfs_ptl_orderid.mainline","is","T"], 
				  "AND", 
				  ["custrecord_rfs_ptl_orderid.location","anyof", locationId], 
				  "AND", 
				  ["custrecord_adv_picktaskline_pickjob","anyof", pickJobs], 
			   ],
			   columns:
			   [
				  search.createColumn({
					 name: "custrecord_adv_picktaskline_pickjob",
					 summary: "GROUP",
					 label: "Pick Job"
				  }),
				   search.createColumn({
					 name: "formulanumeric",
					 summary: "SUM",
					 formula: "CASE WHEN  ({custrecord_rfs_ptl_parent.custrecord_rfs_picktask_picktolp} = 'F') THEN (CASE WHEN {custrecord_rfs_ptl_item.shipindividually} = 'T' THEN {custrecord_rfs_ptl_pick_quantity} WHEN {custrecord_rfs_ptl_pick_quantity} < NVL({custrecord_rfs_ptl_item.custitem_adv_innerctnqty_primary},{custrecord_rfs_ptl_item.custitem_adv_masterctnqty_primary}) THEN {custrecord_rfs_ptl_pick_quantity} WHEN {custrecord_rfs_ptl_item.custitem_adv_importctnqty_primary}<{custrecord_rfs_ptl_item.custitem_adv_masterctnqty_primary} THEN  FLOOR({custrecord_rfs_ptl_pick_quantity}/{custrecord_rfs_ptl_item.custitem_adv_masterctnqty_primary})+nvl((CASE WHEN {custrecord_rfs_ptl_item.custitem_adv_innerctnqty_primary}>0 THEN FLOOR( ({custrecord_rfs_ptl_pick_quantity}-((CASE WHEN {custrecord_rfs_ptl_item.custitem_adv_importctnqty_primary}>0 THEN FLOOR({custrecord_rfs_ptl_pick_quantity}/{custrecord_rfs_ptl_item.custitem_adv_importctnqty_primary}) ELSE 0 END)*NVL({custrecord_rfs_ptl_item.custitem_adv_importctnqty_primary},0))- ((CASE WHEN {custrecord_rfs_ptl_item.custitem_adv_masterctnqty_primary}>0 THEN FLOOR( ({custrecord_rfs_ptl_pick_quantity}-(( CASE WHEN {custrecord_rfs_ptl_item.custitem_adv_importctnqty_primary}>0 THEN FLOOR({custrecord_rfs_ptl_pick_quantity}/{custrecord_rfs_ptl_item.custitem_adv_importctnqty_primary}) ELSE 0 END)*NVL({custrecord_rfs_ptl_item.custitem_adv_importctnqty_primary},0)))/{custrecord_rfs_ptl_item.custitem_adv_masterctnqty_primary}) ELSE 0 END)*NVL({custrecord_rfs_ptl_item.custitem_adv_masterctnqty_primary},0)) )/ {custrecord_rfs_ptl_item.custitem_adv_innerctnqty_primary}) ELSE 0 END ),0)  ELSE  nvl(((CASE WHEN {custrecord_rfs_ptl_item.custitem_adv_importctnqty_primary}>0 THEN FLOOR({custrecord_rfs_ptl_pick_quantity}/{custrecord_rfs_ptl_item.custitem_adv_importctnqty_primary}) ELSE 0 END )*nvl({custrecord_rfs_ptl_item.custitem_adv_importctnqty_primary},0))/ {custrecord_rfs_ptl_item.custitem_adv_masterctnqty_primary},0)+nvl((CASE WHEN {custrecord_rfs_ptl_item.custitem_adv_masterctnqty_primary}>0 THEN FLOOR( ({custrecord_rfs_ptl_pick_quantity}-(( CASE WHEN {custrecord_rfs_ptl_item.custitem_adv_importctnqty_primary}>0 THEN FLOOR({custrecord_rfs_ptl_pick_quantity}/{custrecord_rfs_ptl_item.custitem_adv_importctnqty_primary}) ELSE 0 END)*NVL({custrecord_rfs_ptl_item.custitem_adv_importctnqty_primary},0)))/{custrecord_rfs_ptl_item.custitem_adv_masterctnqty_primary}) ELSE 0 END ),0)+nvl((CASE WHEN {custrecord_rfs_ptl_item.custitem_adv_innerctnqty_primary}>0 THEN FLOOR( ({custrecord_rfs_ptl_pick_quantity}-((CASE WHEN {custrecord_rfs_ptl_item.custitem_adv_importctnqty_primary}>0 THEN FLOOR({custrecord_rfs_ptl_pick_quantity}/{custrecord_rfs_ptl_item.custitem_adv_importctnqty_primary}) ELSE 0 END)*NVL({custrecord_rfs_ptl_item.custitem_adv_importctnqty_primary},0))- ((CASE WHEN {custrecord_rfs_ptl_item.custitem_adv_masterctnqty_primary}>0 THEN FLOOR( ({custrecord_rfs_ptl_pick_quantity}-(( CASE WHEN {custrecord_rfs_ptl_item.custitem_adv_importctnqty_primary}>0 THEN FLOOR({custrecord_rfs_ptl_pick_quantity}/{custrecord_rfs_ptl_item.custitem_adv_importctnqty_primary}) ELSE 0 END)*NVL({custrecord_rfs_ptl_item.custitem_adv_importctnqty_primary},0)))/{custrecord_rfs_ptl_item.custitem_adv_masterctnqty_primary}) ELSE 0 END)*NVL({custrecord_rfs_ptl_item.custitem_adv_masterctnqty_primary},0)) )/ {custrecord_rfs_ptl_item.custitem_adv_innerctnqty_primary}) ELSE 0 END ),0)  END) ELSE 0 END",
					 label: "Parcel Done"
				  }),
				  
				 
			   ]
			});
			
		}
			
		
		

        return {
			onRequest: onRequest_entry 
        };
    }
);