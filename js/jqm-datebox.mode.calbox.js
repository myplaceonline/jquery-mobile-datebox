/*
 * jQuery Mobile Framework : plugin to provide a date and time picker.
 * Copyright (c) JTSage
 * CC 3.0 Attribution.  May be relicensed without permission/notification.
 * https://github.com/jtsage/jquery-mobile-datebox
 */
/* CALBOX Mode */

(function($) {
	$.extend( $.mobile.datebox.prototype.options, {
		themeDateToday: 'b',
		themeDayHigh: 'b',
		themeDatePick: 'b',
		themeDateHigh: 'b',
		themeDateHighAlt: 'b',
		themeDateHighRec: 'b',
		themeDate: 'a',
		
		calHighToday: true,
		calHighPick: true,
		
		calShowDays: true,
		calOnlyMonth: false,
		calWeekMode: false,
		calWeekModeDay: 1,
		calControlGroup: false,
		calShowWeek: false,
		calUsePickers: false,
		calNoHeader: false,
		
		calYearPickMin: -6,
		calYearPickMax: 6,
		
		useTodayButton: false,
		useTomorrowButton: false,
		useCollapsedBut: false,
		
		highDays: false,
		highDates: false,
		highDatesRec: false,
		highDatesAlt: false,
		enableDates: false,
		calDateList: false,
		calShowDateList: false
	});
	$.extend( $.mobile.datebox.prototype, {
		_cal_gen: function (start,prev,last,other,month) {
			var rc = 0, cc = 0, day = 1, 
				next = 1, cal = [], row = [], stop = false;
				
			for ( rc = 0; rc <= 5; rc++ ) {
				if ( stop === false ) {
					row = [];
					for ( cc = 0; cc <= 6; cc++ ) {
						if ( rc === 0 && cc < start ) {
							if ( other === true ) {
								row.push([prev + (cc - start) + 1,month-1]);
							} else {
								row.push(false);
							}
						} else if ( rc > 3 && day > last ) {
							if ( other === true ) {
								row.push([next,month+1]); next++;
							} else {
								row.push(false);
							}
							stop = true;
						} else {
							row.push([day,month]); day++;
							if ( day > last ) { stop = true; }
						}
					}
					cal.push(row);
				}
			}
			return cal;
		},
		_cal_check : function (checkDates, year, month, date, done) {
			var w = this, i,
				o = this.options,
				maxDate = done.x,
				minDate = done.i,
				thisDate = done.t,
				presetDay = done.p,
				day = new this._date(year,month,date,0,0,0,0).getDay(),
				bdRec = o.blackDatesRec,
				hdRec = o.highDatesRec,
				ret = {
					ok: true,
					iso: year + '-' + w._zPad(month+1) + '-' + w._zPad(date),
					theme: o.themeDate,
					recok: true,
					rectheme: false
				};
				
			ret.comp = parseInt(ret.iso.replace(/-/g, ''),10);
			
			if ( bdRec !== false ) {
				for ( i=0; i<o.bdRec.length; i++ ) {
					if ( 
						( bdRec[i][0] === -1 || bdRec[i][0] === year ) &&
						( bdRec[i][1] === -1 || bdRec[i][1] === month ) &&
						( bdRec[i][2] === -1 || bdRec[i][2] === date )
					) { ret.recok = false; } 
				}
			}
			
			if ( $.isArray( o.enableDates ) && $.inArray( ret.iso, o.enableDates ) < 0 ) {
				ret.ok = false;
			} else if ( checkDates ) {
				if (
					( ret.recok !== true ) ||
					( o.afterToday === true && thisDate.comp() > ret.comp ) ||
					( o.beforeToday === true && thisDate.comp() < ret.comp ) ||
					( o.notToday === true && thisDate.comp() === ret.comp ) ||
					( o.maxDays !== false && maxDate.comp() < ret.comp ) ||
					( o.minDays !== false && minDate.comp() > ret.comp ) ||
					( $.isArray(o.blackDays) && $.inArray(day, o.blackDays) > -1 ) ||
					( $.isArray(o.blackDates) && $.inArray(ret.iso, o.blackDates) > -1 ) 
				) {
					ret.ok = false;
				}
			}

			if ( $.isArray(o.whiteDates) && $.inArray(ret.iso, o.whiteDates) > -1 ) { ret.ok = true; }

			if ( ret.ok ) {
				if ( hdRec !== false ) {
					for ( i=0; i < hdRec.length; i++ ) {
						if ( 
							( hdRec[i][0] === -1 || hdRec[i][0] === year ) &&
							( hdRec[i][1] === -1 || hdRec[i][1] === month ) &&
							( hdRec[i][2] === -1 || hdRec[i][2] === date )
						) { ret.rectheme = true; } 
					}
				}
				
				if ( o.calHighPick && date === presetDay && ( w.d.input.val() !== "" || o.defaultValue !== false )) {
					ret.theme = o.themeDatePick;
				} else if ( o.calHighToday && ret.comp === thisDate.comp() ) {
					ret.theme = o.themeDateToday;
				} else if ( $.isArray(o.highDatesAlt) && ($.inArray(ret.iso, o.highDatesAlt) > -1) ) {
					ret.theme = o.themeDateHighAlt;
				} else if ( $.isArray(o.highDates) && ($.inArray(ret.iso, o.highDates) > -1) ) {
					ret.theme = o.themeDateHigh;
				} else if ( $.isArray(o.highDays) && ($.inArray(day, o.highDays) > -1) ) {
					ret.theme = o.themeDayHigh;
				} else if ( $.isArray(o.highDatesRec) && ret.rectheme === true ) {
					ret.theme = o.themeDateHighRec;
				}
			}
			return ret;
		}
	});
	$.extend( $.mobile.datebox.prototype._build, {
		'calbox': function () {
			var tempVal, pickerControl, calContent, genny, weekdayControl, listControl,
				row, col, rows, cols, htmlRow, i, prangeS, prangeL,
				w = this,
				o = this.options,
				dList = o.calDateList,
				uid = "ui-datebox-",
				curDate = w.theDate,
				checked = false,
				checkDatesObj = {},
				minDate = w.initDate.copy(),
				maxDate = w.initDate.copy(),
				cStartDay = (curDate.copy([0],[0,0,1]).getDay() - w.__('calStartDay') + 7) % 7,
				curMonth = curDate.get(1),
				curYear = curDate.get(0),
				curDateArr = curDate.getArray(),
				presetDate = (w.d.input.val() === "") ? w._startOffset(w._makeDate(w.d.input.val())) : w._makeDate(w.d.input.val()),
				presetDay = -1,
				cTodayDate = new w._date(),
				cTodayDateArr = cTodayDate.getArray(),
				weekNum = curDate.copy([0],[0,0,1]).adj(2,(-1*cStartDay)+(w.__('calStartDay')===0?1:0)).getDWeek(4),
				weekModeSel = 0,
				isTrueMonth = false,
				isTrueYear = false,
				cMonthEnd = 32 - w.theDate.copy([0],[0,0,32,13]).getDate(),
				cPrevMonthEnd = 32 - w.theDate.copy([0,-1],[0,0,32,13]).getDate(),
				checkDates = ( o.afterToday || o.beforeToday || o.notToday || o.maxDays || o.minDays || o.blackDays || o.blackDates ) ? true : false;
				
			
				
			if ( typeof w.d.intHTML !== 'boolean' ) { 
				w.d.intHTML.remove(); 
				w.d.intHTML = null;
			}
			
			w.d.headerText = ((w._grabLabel() !== false)?w._grabLabel():w.__('titleDateDialogLabel'));
			w.d.intHTML = $('<span>');

			$("<div class='" + uid + "gridheader'><div class='" + uid + "gridlabel'><h4>" +
				w._formatter( w.__( 'calHeaderFormat' ), w.theDate ) +
				"</h4></div></div>")
					.appendTo(w.d.intHTML);
				
			// Previous and next month buttons, define booleans to decide if they should do anything
			$("<div class='"+uid+"gridplus"+(w.__('isRTL')?'-rtl':'')+"'><a href='#'>"+w.__('nextMonth')+"</a></div>")
				.prependTo(w.d.intHTML.find( "." + uid + "gridheader" ) )
				.find('a')
					.addClass( "ui-btn-inline ui-link ui-btn ui-btn-" + o.themeDate + " ui-icon-arrow-r ui-btn-icon-notext ui-shadow ui-corner-all" )
					.on(o.clickEventAlt, function(e) {
						e.preventDefault();
						if ( w.calNext ) {
							if ( w.theDate.getDate() > 28 ) { w.theDate.setDate(1); }
							w._offset('m',1);
						}
				});
			$("<div class='"+uid+"gridminus"+(w.__('isRTL')?'-rtl':'')+"'><a href='#'>"+w.__('prevMonth')+"</a></div>")
				.prependTo(w.d.intHTML.find( "." + uid + "gridheader" ) )
				.find('a')
					.addClass( "ui-btn-inline ui-link ui-btn ui-btn-" + o.themeDate + " ui-icon-arrow-l ui-btn-icon-notext ui-shadow ui-corner-all" )
					.on(o.clickEventAlt, function(e) {
						e.preventDefault();
						if ( w.calPrev ) {
							if ( w.theDate.getDate() > 28 ) { w.theDate.setDate(1); }
							w._offset('m',-1);
						}
					});
				
			if ( o.calNoHeader === true ) { w.d.intHTML.find('.'+uid+'gridheader').remove(); }
			
			w.calNext = true;
			w.calPrev = true;
			
			if ( Math.floor(cTodayDate.comp() / 100)  === Math.floor(curDate.comp() / 100) ) { isTrueMonth = true; }
			if ( Math.floor(cTodayDate.comp() / 10000)  === Math.floor(curDate.comp() / 10000) ) { isTrueYear = true; }
			if ( presetDate.comp() === curDate.comp() ) { presetDay = presetDate.get(2); }
			
			if ( o.afterToday === true && ( isTrueMonth || ( isTrueYear && cTodayDateArr[1] >= curDateArr[1] ) ) ) {
				w.calPrev = false; }
			if ( o.beforeToday === true && ( isTrueMonth || ( isTrueYear && cTodayDateArr[1] <= curDateArr[1] ) ) ) {
				w.calNext = false; }
			
			if ( o.minDays !== false ) {
				minDate.adj( 2, o.minDays * -1 );
				tempVal = minDate.getArray();
				if ( curDateArr[0] === tempVal[0] && curDateArr[1] <= tempVal[1] ) { w.calPrev = false;}
			}
			if ( o.maxDays !== false ) {
				maxDate.adj( 2, o.maxDays );
				tempVal = minDate.getArray();
				if ( curDateArr[0] === tempVal[0] && curDateArr[1] >= tempVal[1] ) { w.calNext = false;}
			}
			
			if ( o.calUsePickers === true ) {
				pickerControl = $("<div>", {
					"class": "ui-grid-a ui-datebox-grid",
					style: "padding-top: 5px; padding-bottom: 5px;"
				});
				
				pickerControl.a = $("<div class='ui-block-a'><select name='pickmon'></select></div>").appendTo(pickerControl).find('select');
				pickerControl.b = $("<div class='ui-block-b'><select name='pickyar'></select></div>").appendTo(pickerControl).find('select');
				
				for ( i=0; i<=11; i++ ) {
					pickerControl.a.append(
						$( "<option value='" + i + "'" + ( ( curMonth === i ) ? " selected='selected'" : "" ) + ">" +
						w.__( 'monthsOfYear' )[ i ] + "</option>" ) );
				}
				
				if ( o.calYearPickMin < 1 ) { 
					prangeS = curYear + o.calYearPickMin;
				} else if ( o.calYearPickMin < 1800 ) {
					prangeS = curYear - o.calYearPickMin;
				} else if ( o.calYearPickMin === "NOW" ) {
					prangeS = cTodayDateArr[0];
				} else {
					prangeS = o.calYearPickMin;
				}
				
				if ( o.calYearPickMax < 1800 ) {
					prangeL = curYear + o.calYearPickMax;
				} else if ( o.calYearPickMax === "NOW" ) {
					prangeL = cTodayDateArr[0];
				} else {
					prangeL = o.calYearPickMax;
				}
				for ( i = prangeS; i <= prangeL; i++ ) {
					pickerControl.b.append(
						$( "<option value='" + i + "'" + ( ( curYear===i ) ? " selected='selected'" : "" ) + ">" + i + "</option>" ) );
				}
				
				pickerControl.a.on('change', function () {
					w.theDate.setD( 1, $( this ).val() );
					if ( w.theDate.get(1) !== parseInt( $( this ).val(), 10 ) ) {
						w.theDate.setD( 2, 0 );
					}
					w.refresh();
				});
				pickerControl.b.on('change', function () {
					w.theDate.setD( 0, $( this ).val() );
					if (w.theDate.get(1) !== parseInt( pickerControl.a.val(), 10)) {
						w.theDate.setD( 2, 0 );
					}
					w.refresh();
				});
				
				pickerControl.find( "select" ).selectmenu( { mini: true, nativeMenu: true } );
				pickerControl.appendTo( w.d.intHTML );
			}
			
			calContent = $("<div class='" + uid + "grid'>" ).appendTo( w.d.intHTML );
			
			if ( o.calShowDays ) {
				w._cal_days = w.__('daysOfWeekShort').concat(w.__('daysOfWeekShort'));
				weekdayControl = $( "<div>", { "class": uid + "gridrow" } ).appendTo( calContent );
				if ( w.__('isRTL') === true ) { weekdayControl.css( "direction", "rtl" ); }
				if ( o.calShowWeek ) { 
					$("<div>")
						.addClass( uid + "griddate " + uid + "griddate-empty " + uid + "griddate-label" )
						.appendTo( weekdayControl );
				}
				for ( i=0; i<=6;i++ ) {
					$( "<div>" )
						.text( w._cal_days[ ( i + w.__('calStartDay') ) % 7 ] )
						.addClass( uid + "griddate " + uid + "griddate-empty " + uid + "griddate-label" )
						.appendTo( weekdayControl );
				}
			}

			checkDatesObj = { i: minDate, x: maxDate, t: cTodayDate, p: presetDay };
			genny = w._cal_gen( cStartDay, cPrevMonthEnd, cMonthEnd, !o.calOnlyMonth, curDate.get(1) );

			for ( row = 0, rows = genny.length; row < rows; row++ ) {
				htmlRow = $("<div>", { "class": uid + "gridrow" } );
				if ( w.__( 'isRTL' ) ) { htmlRow.css( "direction", "rtl" ); }
				if ( o.calShowWeek ) {
						$("<div>", { "class": uid + "griddate " + uid + "griddate-empty" } )
							.text( "W" + weekNum )
							.appendTo( htmlRow );
						weekNum++;
						if ( weekNum > 52 && typeof(genny[ row + 1 ]) !== "undefined" ) { 
							weekNum = new w._date(
								curDateArr[0],
								curDateArr[1],
								( w.__('calStartDay')===0 ) ? genny[ row + 1 ][ 1 ][ 0 ] : genny[ row + 1 ][ 0 ][ 0 ],
								0, 0, 0, 0
							).getDWeek( 4 ); }
					}
				for ( col=0, cols = genny[row].length; col < cols; col++ ) {
					if ( o.calWeekMode ) { 
						weekModeSel = genny[row][o.calWeekModeDay][0]; 
					}
					if ( typeof genny[row][col] === "boolean" ) {
						$("<div>", { "class": uid + "griddate " + uid + "griddate-empty" } ).appendTo( htmlRow );
					} else {
						checked = w._cal_check( checkDates, curDateArr[0], genny[row][col][1], genny[row][col][0], checkDatesObj );
						if ( genny[row][col][0]) {
							$("<div>")
								.text( String( genny[row][col][0] ) )
								.addClass( curMonth === genny[row][col][1] ?
									( uid + "griddate ui-corner-all ui-btn ui-btn-" + checked.theme + ( checked.ok ? "" : " ui-state-disabled" ) ):
									( uid + "griddate " + uid + "griddate-empty" )
								)
								.css(( curMonth !== genny[row][col][1] && !o.calOnlyMonth ) ? { cursor: "pointer" } : {})
								.data( "date", 
									( ( o.calWeekMode ) ? weekModeSel : genny[row][col][0] ) )
								.data( "enabled", checked.ok)
								.data( "month", genny[row][((o.calWeekMode)?o.calWeekModeDay:col)][1])
								.appendTo(htmlRow);
						}
					}
				}
				if ( o.calControlGroup === true ) {
					htmlRow
						.find( ".ui-corner-all" )
						.removeClass( "ui-corner-all" )
						.eq(0)
							.addClass("ui-corner-left")
							.end()
						.last()
							.addClass( "ui-corner-right" )
							.addClass( "ui-controlgroup-last" );
				}
				htmlRow.appendTo(calContent);
			}
			if ( o.calShowWeek ) { calContent.find( "." + uid + "griddate" ).addClass( uid + "griddate-week" ); }
			
			if ( o.calShowDateList === true && dList !== false ) {
				listControl = $( "<div>" );
				listControl.a = $( "<select name='pickdate'></select>" ).appendTo(listControl);
				
				listControl.a.append("<option value='false' selected='selected'>" + w.__( 'calDateListLabel' ) + "</option>" );
				for ( i = 0; i < dList.length; i++ ) {
					listControl.a.append( $( "<option value='" + dList[i][0] + "'>" + dList[i][1] + "</option>" ) );
				}
				
				listControl.a.on( "change", function() {
					tempVal = $(this).val().split('-');
					w.theDate = new w._date(tempVal[0], tempVal[1]-1, tempVal[2], 0,0,0,0);
					w._t( { method: "doset" } );
				});
				
				listControl.find( "select" ).selectmenu( { mini: true, nativeMenu: true } );
				listControl.appendTo( calContent );
			}
			
			if ( o.useTodayButton || o.useTomorrowButton || o.useClearButton ) {
				htmlRow = $("<div>", { "class": uid + "controls" } );
				
				if ( o.useTodayButton ) {
					$( "<a href='#' role='button'>" + w.__( 'calTodayButtonLabel' ) + "</a>" )
						.appendTo(htmlRow)
						.addClass( "ui-btn ui-btn-" + o.theme + " ui-icon-navigation ui-btn-icon-left ui-shadow ui-corner-all" )
						.on(o.clickEvent, function(e) {
							e.preventDefault();
							w.theDate = w._pa([0,0,0], new w._date());
							w._t( { method: "doset" } );
						});
				}
				if ( o.useTomorrowButton ) {
					$( "<a href='#' role='button'>" + w.__( 'calTomorrowButtonLabel' ) + "</a>" )
						.appendTo(htmlRow)
						.addClass( "ui-btn ui-btn-" + o.theme + " ui-icon-navigation ui-btn-icon-left ui-shadow ui-corner-all" )
						.on(o.clickEvent, function(e) {
							e.preventDefault();
							w.theDate = w._pa([0,0,0], new w._date()).adj( 2, 1 );
							w._t( { method: "doset" } );
						});
				}
				if ( o.useClearButton ) {
					$( "<a href='#' role='button'>" + w.__( 'clearButton' ) + "</a>" )
						.appendTo(htmlRow)
						.addClass( "ui-btn ui-btn-" + o.theme + " ui-icon-delete ui-btn-icon-left ui-shadow ui-corner-all" )
						.on(o.clickEventAlt, function(e) {
							e.preventDefault();
							w.d.input.val('');
							w._t( { method: "clear" } );
							w._t( { method: "close" } );
						});
				}
				if ( o.useCollapsedBut ) {
					htmlRow.addClass( "ui-datebox-collapse" );
				}
				htmlRow.appendTo( calContent );
			}
			
			w.d.intHTML.on(o.clickEventAlt, "div." + uid + "griddate", function(e) {
				e.preventDefault();
				if ( $( this ).data( "enabled" ) ) {
					w.theDate.setD(2,1).setD(1,$(this).jqmData( "month" )).setD(2,$(this).data( "date" ));
					w._t( {
						method: "set",
						value: w._formatter( w.__fmt(),w.theDate ),
						date: w.theDate
					} );
					w._t( { method: "close" } );
				}
			});
			w.d.intHTML
				.on( "swipeleft", function() { if ( w.calNext ) { w._offset( 'm', 1 ); } } )
				.on( "swiperight", function() { if ( w.calPrev ) { w._offset( 'm', -1 ); } } );
			
			if ( w.wheelExists ) { // Mousewheel operations, if plugin is loaded
				w.d.intHTML.on( "mousewheel", function(e,d) {
					e.preventDefault();
					if ( d > 0 && w.calNext ) { 
						w.theDate.setD(2,1);
						w._offset('m', 1);
					}
					if ( d < 0 && w.calPrev ) {
						w.theDate.setD(2,1);
						w._offset('m', -1);
					}
				});
			}
		}
	});
})( jQuery );
