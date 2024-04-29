"use strict"
const planModel = require("../Models/planModel");

async function searchByOperations(req,res) {
    let {SQFTUpper,SQFTLower,widthUpper,widthLower,lengthUpper,lengthLower,heightUpper,heightLower,floors} = req.query;
    let operations = req.query.searchOperations;
    /*
        searchOperations is supposed to be an array of strings. checboxes return
        as arrays of strings ONLY if multiple boxes are checked. the block below
        makes sure that searchOperations is ALWAYS an array when the request is
        sent to the server.
    */
    if (typeof operations != "object") {
        operations = [operations]
    }
    /*
        all of the input values except for searchOperations need to be parsed from
        strings to integers in order to be fed to the database
    */
    SQFTUpper = parseInt(SQFTUpper);
    SQFTLower = parseInt(SQFTLower);
    lengthUpper = parseInt(lengthUpper);
    lengthLower = parseInt(lengthLower);
    widthUpper = parseInt(widthUpper);
    widthLower = parseInt(widthLower);
    heightUpper = parseInt(heightUpper);
    heightLower = parseInt(heightLower);
    floors = parseInt(floors);

    let results = await planModel.generalSearch(req.query,operations);
    /*
        currentResults are the results gotten from each iteration of this loop.
        the function will go through each element in the "operations" array and for each element
        it will conduct the corresponding search operation to that particular string,
        and add it's results to the total search results without creating duplicates. 
        
        ** NOTE: currently there's a limitation where the search result will return
        all values that meet every criteria first, then every value that meets
        AT LEAST ONE criteria after that. I haven't figured out how yet but this needs
        to be changed so that it exclusively returns values that meet all critiera,
        since most people search by their given constraints for a reason. 
    */
    // for(let i = 0; i < operations.length; i++) {
    //     let currentResults;
    //     if (operations[i] === "searchBySQFT") {
    //         currentResults = planModel.searchBySQFT(SQFTLower,SQFTUpper);
    //     } else if (operations[i] === "searchByWidth") {
    //         currentResults = planModel.searchByWidth(widthLower,widthUpper);
    //     } else if (operations[i] === "searchByLength") {
    //         currentResults = planModel.searchByLength(lengthLower,lengthUpper);
    //     } else if (operations[i] === "searchByHeight") {
    //         currentResults = planModel.searchBySidewallLength(heightLower, heightUpper);
    //     } else if (operations[i] === "searchByFloors") {
    //         currentResults = planModel.searchByFloors(floors);
    //     } else {
    //         // console the results for debugging and return 404 if the operation input isn't valid
    //         console.log(results);
    //         return res.sendStatus(404);
    //     }
    //     results = [...results, currentResults];
    // }
    if(!results) {
        return res.sendStatus(404);
    }
    // CJ, this'll be needed for the frontend. this will allow is to render
    // the whole list of search results.
    console.log(results);
    return res.json(results);
    //res.render("results", {"results": results});
}

function addToDatabase(req, res) {
    console.log(req.body);
    let { planID, overallSQFT, lengthFt, lengthIn, widthFt, widthIn, heightFt, heightIn, floors } = req.body;
    
    // Parse individual parameters to integers
    planID = parseInt(planID);
    overallSQFT = parseInt(overallSQFT);
    lengthFt = parseInt(lengthFt);
    lengthIn = parseInt(lengthIn);
    widthFt = parseInt(widthFt);
    widthIn = parseInt(widthIn);
    heightFt = parseInt(heightFt);
    heightIn = parseInt(heightIn);
    floors = parseInt(floors);
    console.log(req.query);

    // Call addPlan with an object containing parsed parameters
    planModel.addPlan({ planID,overallSQFT, lengthFt, lengthIn, widthFt, widthIn, heightFt, heightIn, floors });
    
    // Send response
    res.redirect("/add");
    return res.json({ message: "Plan added successfully" });
}

async function editPlan(req,res) {
    try {
        console.log(req.body);
        let {planID,overallSQFT, lengthFt, lengthIn, widthFt, widthIn, heightFt, heightIn, floors } = req.body;
        planID = parseInt(planID);
        overallSQFT = parseInt(overallSQFT);
        lengthFt = parseInt(lengthFt);
        lengthIn = parseInt(lengthIn);
        widthFt = parseInt(widthFt);
        widthIn = parseInt(widthIn);
        heightFt = parseInt(heightFt);
        heightIn = parseInt(heightIn);
        floors = parseInt(floors);
    
        await planModel.editPlan(req.body.planID,{overallSQFT, lengthFt, lengthIn, widthFt, widthIn, heightFt,heightIn, heightIn, floors});
        res.redirect("/edit");
        return res.json({ message: "plan edited successfully"});
    } catch (error) {
        console.error("Error editing plan:", error);
        res.status(500).json({error: 'An error occured'});
    }

}

async function deletePlan(req, res) {
    try {
        const {planID} = req.body;
        console.log(req.body);
        await planModel.deletePlan(planID);
        res.status(200).json({message: 'Plan deleted successfully'});
        } catch (error) {
            console.error('Error deleting plan:', error);
            res.status(500).json({error: 'An error occured'});
        }
    }

// this will also allow us to render individual search results, so that a user
// can click on whatever number they want and get more detailed information about
// that plan. 
function renderSingleResult(req,res) {
    const plan = planModel.getPlanByID(req.params.planID);
    if(!plan) {
        return res.sendStatus(404);
    }
    res.render("singlePlanPage", {"plan":plan});
}


module.exports = {
    searchByOperations,
    renderSingleResult,
    addToDatabase,
    editPlan,
    deletePlan
}