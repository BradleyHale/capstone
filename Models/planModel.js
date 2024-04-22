"use strict";
const db = require("./db");

function generalSearch(params, searchOperations = []) {
    let { SQFTLower, SQFTUpper, lengthUpper, lengthLower, widthUpper, widthLower, HeightUpper, HeightLower, floors} = params;
    let conditions = [];
    let args = {};
    //console.log(params);
    
    // Add conditions based on search operations
    searchOperations.forEach(operation => {
        switch (operation) {
            case 'searchBySQFT':
                if (SQFTLower !== undefined && SQFTUpper !== undefined) {
                    conditions.push(`overallSQFT >= @SQFTLower`);
                    conditions.push(`overallSQFT <= @SQFTUpper`);
                    args['SQFTLower'] = SQFTLower;
                    args['SQFTUpper'] = SQFTUpper;
                }
                break;
            case 'searchByWidth':
                if (widthLower !== undefined && widthUpper !== undefined) {
                    conditions.push(`widthFt <= @widthUpper`);
                    conditions.push(`widthFt >= @widthLower`);
                    args['widthLower'] = widthLower;
                    args['widthUpper'] = widthUpper;
                }
                break;
            case 'searchByLength':
                if (lengthLower !== undefined && lengthUpper !== undefined) {
                    conditions.push(`lengthFt <= @lengthUpper`);
                    conditions.push(`lengthFt >= @lengthLower`);
                    args['lengthLower'] = lengthLower;
                    args['lengthUpper'] = lengthUpper;
                }
                break;
            case 'searchByHeight':
                if (HeightLower !== undefined && HeightUpper !== undefined) {
                    conditions.push(`HeightFt <= @HeightUpper`);
                    conditions.push(`HeightFt >= @HeightLower`);
                    args['HeightLower'] = HeightLower;
                    args['HeightUpper'] = HeightUpper;
                }
                break;

            case 'searchByFloors':
                if (floors !== undefined) {
                    conditions.push(`floors = @floors`);
                    args['floors'] = floors;
                }
                break;
        }
    });

    console.log("current conditions: ", conditions)
    console.log("args: ", args)
    // Construct the WHERE clause
    let whereClause = '';
    if (conditions.length > 0) {
        whereClause = 'WHERE ' + conditions.join(' AND ');
    }
    console.log("current Where Clause: ", whereClause)

    // Prepare and execute SQL query
    const sqlQuery = `SELECT * FROM plans ${whereClause}`;
    const stmt = db.prepare(sqlQuery);
    const result = stmt.all(args);

    return result;
}

function addPlan(data) {
    const keys = Object.keys(data);
    const values = Object.values(data);

    const sqlQuery = `INSERT INTO plans (${keys.join(', ')}) VALUES (${keys.map(() => '?').join(', ')})`;

    const stmt = db.prepare(sqlQuery);
    stmt.run(...values);

}

/*
    MODIFY DATABASE:
    INSERT INTO plans(columns) VALUES (values)
    how do you go about doing this?
    a similar structure to the add function, however: each column should be input into a "columns" string,
    and each value being inserted into a "values" string
    once those strings are complete, do a similar loop for the columns and values clauses

    let columnClause = '';
    if(columns.length > 0) {
        columnClause = 'plans(' + columns.join() + ')');
    }

    let valueClause = '';
    if (values.length > 0) {
        valueClause = 'VALUES(' + values.join() + ')');
    }
*/

function editPlan(planID, params) {
    let {overallSQFT, lengthFt, lengthIn, widthFt, widthIn, heightFt, heightIn, floors } = params;
    console.log(params);
    let setValues = [];
    let updates = [];
    let args = {'planID': planID };

    if (overallSQFT != undefined) {
        setValues.push('overallSQFT');
        updates.push(`overallSQFT = @overallSQFT`);
        args['overallSQFT'] = overallSQFT;
    }
    if (lengthFt != undefined) {
        updates.push(`lengthFt = @lengthFt`);
        args['lengthFt'] = lengthFt;
    }
    if (lengthIn != undefined) {
        updates.push(`lengthIn = @lengthIn`);
        args['lengthIn'] = lengthIn;
    }
    if (widthFt != undefined) {
        updates.push(`widthFt = @widthFt`);
        args['widthFt'] = widthFt;
    }
    if (widthIn != undefined) {
        setValues.push('widthIn')
        updates.push(`widthIn = @widthIn`);
        args['widthIn'] = widthIn;
    }
    if (heightFt != undefined) {
        updates.push(`heightFt = @heightFt`);
        args['heightFt'] = heightFt;
    }
    if (heightIn != undefined) {
        updates.push(`heightIn = @heightIn`);
        args['heightIn'] = heightIn;
    }
    if (floors != undefined) {
        updates.push(`floors = @floors`);
        args['floors'] = floors;
    }
    console.log("current updates", updates);
    console.log("args", args);
    const sqlQuery = `UPDATE plans SET ${updates} WHERE planID =@planID`;
    console.log("sql query", sqlQuery);
    const stmt = db.prepare(sqlQuery);
    stmt.run(args);
}

function deletePlan(planID) {
    const sql = `DELETE FROM plans WHERE planID =@planID`;
    const stmt = db.prepare(sql);
    stmt.run({"planID": planID});
}

function testFunction() {
    const sql = `SELECT * FROM plans`;
    const stmt = db.prepare(sql);
    const result = stmt.all();
    return result;
}
// ----------------- anything below this line is legacy code!!!!!! ------------------------
function searchByWidth(upper, lower) {
    const sql = `SELECT * FROM plans WHERE widthFt BETWEEN @upper AND @lower`;
    const stmt = db.prepare(sql);
    const result = stmt.all({
       "upper":upper,
       "lower":lower
    });
    return result;

}

function searchByHeight(upper, lower) {
    const sql = `SELECT * FROM plans WHERE heightFt BETWEEN @upper AND @lower`;
    const stmt = db.prepare(sql);
    const result = stmt.all({
       "upper":upper,
       "lower":lower
    });
    return result;

}

function searchBySQFT(upper, lower) {
    const sql = `SELECT * FROM plans WHERE overallSQFT BETWEEN @upper AND @lower`;
    const stmt = db.prepare(sql);
    const result = stmt.all({
        "upper":upper,
        "lower":lower
    });
    return result;

}

function searchByFloors(floors) {
    const sql = `SELECT * FROM plans WHERE floors=@floors`;
    const stmt = db.prepare(sql);
    const result = stmt.all({
        "floors":floors
    });
    return result;

}

function getPlanByID(planID) {
    const sql = 'SELECT * FROM plans WHERE planID=@planID';
    const stmt = db.prepare(sql);
    const row = stmt.get({planID});
    return row;
}
// legacy code is now over --------------------------------------------------------
module.exports = {
    testFunction,
    searchByFloors,
    searchByWidth,
    searchBySQFT,
    getPlanByID,
    searchByHeight,
    generalSearch,
    deletePlan,
    editPlan,
    addPlan
}