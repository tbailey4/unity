//Terrain Slicing & Dynamic Loading Kit copyright © 2012 Kyle Gillen. All rights reserved. Redistribution is not allowed.
#pragma strict

@script AddComponentMenu("Terrain Slicing Kit/Draw Detail Map")

var detailResolutionPerPatch : int = 8;
var points : Vector3[];
var justStarted : boolean = true;
var y : float = 0;
var vectorLength : int;
var mapColor : Color = Color.white;
var drawMap : boolean = true;

function Awake()
{
    Destroy(this);
}