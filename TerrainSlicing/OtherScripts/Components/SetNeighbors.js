//Terrain Slicing & Dynamic Loading Kit copyright © 2012 Kyle Gillen. All rights reserved. Redistribution is not allowed.
#pragma strict

@script AddComponentMenu("Terrain Slicing Kit/Set Neighbors")

var columns : int = 1;
var rows : int = 1;
var emptyLocations : boolean = false;
var terrains : Terrain[];
var showFoldout : boolean = true;
var test : int[,];

function Start()
{
	if(!SetTheNeighbors())
		Debug.Log("Set Neighbors Failed.");
}

private function SetTheNeighbors() : boolean
{
	var allTerrainsFilled : boolean = true;
	var row : int;
	var col : int;
	var i : int;
	for(i = 0; i < rows*columns; i++)
	{
		if(terrains[i] == null)
			allTerrainsFilled = false;
	}

	if(!allTerrainsFilled && !emptyLocations)
	{
		Debug.Log("Empty locations were found when they were not expected to exist.");
		return false;
	}
	else
	{
		//Create an empty 1 terrain wide buffer around our terrains, which will make setting neighbors easier
		var terrainsToSet : Terrain[,] = new Terrain[rows+2, columns+2];
		i = 0;
		for(row = 0; row < terrainsToSet.GetLength(0); row++)
		{
			for(col = 0; col < terrainsToSet.GetLength(1); col++)
			{
				if(row == 0 || row == rows+1 || col == 0 || col == columns+1)
					terrainsToSet[row,col] = null;
				else
				{
					terrainsToSet[row, col] = terrains[i];
					i++;
				}
			}
		}
	
		//Set Neighbors
		for(row = 1; row <= rows; row++)
		{
			for(col = 1; col <= columns; col++)
			{
				if(terrainsToSet[row,col] != null)
					terrainsToSet[row,col].SetNeighbors(terrainsToSet[row,col-1], terrainsToSet[row+1,col], terrainsToSet[row,col+1], terrainsToSet[row-1,col]);
			}
		}
		return true;
	}
}
