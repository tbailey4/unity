//Terrain Slicing & Dynamic Loading Kit copyright © 2012 Kyle Gillen. All rights reserved. Redistribution is not allowed.

@CustomEditor(DrawDetailMap)
class DrawDetailMapEditor extends Editor {
	
    private var points : Vector3[];
	private var pos : Vector3;
	private var lastPos : Vector3;
	private var rot : Quaternion;
	private var internalY : float;
	
	private var isTerrain : boolean;
	private var terrain : Terrain;
	private var data : TerrainData;
	private var i : int;
	private var vectorLength : int;

    private var drawMapProp : SerializedProperty;
	private var mapColorProp : SerializedProperty;
    private var resPerPatchProp : SerializedProperty;
    private var gridHeightProp : SerializedProperty;


	function OnEnable()
	{
	    drawMapProp = serializedObject.FindProperty("drawMap");
	    mapColorProp = serializedObject.FindProperty("mapColor");
	    resPerPatchProp = serializedObject.FindProperty("detailResolutionPerPatch");
	    gridHeightProp = serializedObject.FindProperty("y");

	    var gO : GameObject = target.gameObject;
	    terrain = gO.GetComponent("Terrain");
	    if(terrain == null)
	    {
	        isTerrain = false;
	        Debug.Log("Object is not a Terrain - This script will only work on Terrains!");
	    }
	    else
	    {
	        isTerrain = true;
	        data = terrain.terrainData;
	        pos = target.transform.position;
	        lastPos = pos;
	        rot = target.transform.rotation;
	        internalY = target.y;
	        if(target.justStarted)//If this script was just attached to the terrain, get the position for the cut area from the terrains position
	        {
	            CalculatePoints();	
	            target.justStarted = false;
	        }
	        else //else the position is stored in the CutOutTerrain script and we get the position from there. This keeps the cut area from constantly resetting when we deselect the terrain.
	            points = target.points;
			
	    }		
	}
	
        function OnDestroy()
        {
            target.points = points;
        }
	
        function OnSceneGUI() 
        {
            if(isTerrain)
            {
                Handles.color = target.mapColor;
                pos = target.transform.position;
                if(pos != lastPos)//Check if the terrain has moved -- shouldn't happen but just in case, we need to move our handles position.
                {
	    		
                    var changeX : float = pos.x - lastPos.x;
                    for(i = 0; i < target.vectorLength; i++)
                        points[i].x += changeX;
    		
                    var changeZ : float = pos.z - lastPos.z;
                    for(i = 0; i < target.vectorLength; i++)
                        points[i].z += changeZ;
    		
                    var changeY : float = pos.y - lastPos.y;
                    for(i = 0; i < target.vectorLength; i++)
                        points[i].y += changeY;
	    		
                    lastPos = pos;
                }
	    	
                if(!Mathf.Approximately(target.y, internalY))
                {
                    changeY = target.y - internalY;
                    for(i = 0; i < target.vectorLength; i++)
                        points[i].y += changeY;
	    			
                    internalY = target.y;
                }
	    	
                if(target.drawMap)
                {
                    for(i = 0; i < 3; i++)
                        Handles.DrawLine(points[i], points[i+1]);
			    	
                    //Complete the square by connecting Bottom Right and Bottom left point
                    Handles.DrawLine(points[0], points[3]);
			    
                    //Now draw the inside lines				
                    for(i = 4; i < target.vectorLength; i += 2)
                        Handles.DrawLine(points[i], points[i+1]);
                }
            }
        }  

        function OnInspectorGUI()
        {
            serializedObject.Update();
            EditorGUILayout.PropertyField(drawMapProp);
            //target.drawMap = EditorGUILayout.Toggle("EnableMap", target.drawMap);
            if(drawMapProp.boolValue)
            {
                EditorGUILayout.PropertyField(resPerPatchProp);
                EditorGUILayout.PropertyField(gridHeightProp, TerrainSlicingKit.LabelDatabase.gridHeightLabel);
                EditorGUILayout.PropertyField(mapColorProp);

                if(GUILayout.Button(TerrainSlicingKit.LabelDatabase.recalculateDataButtonLabel))
                    CalculatePoints();
            }
    	  
            serializedObject.ApplyModifiedProperties();	
        }
    
        function CalculatePoints()
        {
            var width : float = data.size.x;
            var length : float = data.size.z;
            var detRes : int = data.detailResolution;		
            var divisions : int = detRes / target.detailResolutionPerPatch;
            target.vectorLength = ((divisions - 1) * 4) + 4;
            points = new Vector3[target.vectorLength];
            var cutoff : int = target.vectorLength - ((divisions - 1) * 2);
            //Bottom left points
            points[0] = lastPos;
		
            //Top Left point
            points[1] = lastPos;
            points[1].z += length;
		
            //Top Right Point
            points[2] = points[1];
            points[2].x += width;
		
            //Bottom right point
            points[3] = lastPos;
            points[3].x += width;
		
            //The inside points
            var incrementX : float = width / divisions;
            var incrementZ : float = length / divisions;
            var posX : float = lastPos.x + incrementX;
            var posZ : float = lastPos.z + incrementZ;
            var x : float = lastPos.x;
            var x2 : float = x + width;
            var z : float = lastPos.z;
            var z2 : float = z + length;
            var y : float = lastPos.y;
		
            for(i = 4; i < target.vectorLength; i += 2)
            {
                if(i < cutoff)
                {
                    points[i] = Vector3(x, y, posZ);
                    points[i+1] = Vector3(x2, y, posZ);
                    posZ += incrementZ; 
                }
                else
                {
                    points[i] = Vector3(posX, y, z);
                    points[i+1] = Vector3(posX, y, z2);
                    posX += incrementX;
                }
            }
		
            for(i = 0; i < target.vectorLength; i++)
                points[i].y += target.y;
			
            target.points = new Vector3[target.vectorLength];
            target.points = points;
        }
    
    }