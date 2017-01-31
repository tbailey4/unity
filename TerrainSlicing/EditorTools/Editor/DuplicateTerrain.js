//Terrain Slicing & Dynamic Loading Kit copyright © 2015 Kyle Gillen. All rights reserved. Redistribution is not allowed.

class DuplicateTerrain extends EditorWindow
{
	
	@MenuItem ("Terrain/Terrain Slicing Kit/Duplicate Terrain(s)")
    static function DuplicateTheTerrain () 
    {
    	if(Application.isPlaying)
		{
			EditorUtility.DisplayDialog("Error", "The Terrain Duplicator Tool cannot operate in play mode. Exit play mode and reselect Duplicate Option.", "Close");
			return;
		}
    	
        var selections : GameObject[] = Selection.gameObjects;
        var terrains : Terrain[] = new Terrain[selections.Length];
        //Get the terrain component from each gameobject if it exists.
        var i : int;
        var count : int = 0;
        for(i = 0; i < selections.Length; i++)
        {
        	terrains[i] = selections[i].GetComponent(Terrain);
        	if(terrains[i] != null)
        		count++;
        }
        
        //No terrains were found
        if(count == 0)
        {
        	EditorUtility.DisplayDialog("Error", "No terrains were selected!", "OK");
        	return;
        }
        
        for(i = 0; i < terrains.Length; i++)
        {
        	if(terrains[i] != null)
        	{
	        	var data : TerrainData = terrains[i].terrainData;
	        	var assetPath : String = AssetDatabase.GetAssetPath(data);
	        	var split = assetPath.Split("/"[0]);
	        	split[split.Length-1] = terrains[i].name + "_Data_Duplicate.asset";
	        	var newAssetPath = String.Join("/", split);

	        	newAssetPath = AssetDatabase.GenerateUniqueAssetPath(newAssetPath);
	        	if(!AssetDatabase.CopyAsset(assetPath, newAssetPath))
	        	{
	        		if(!EditorUtility.DisplayDialog("Error", "Terrain Duplication for " + terrains[i].name + " failed for unknown reason. Continue trying to duplicate other terrains? ", "Continue", "Stop Duplication Process"))
	        			return;
	        	}
	        	else
	        	{
	        		AssetDatabase.Refresh();
	        		var terrain : GameObject = Terrain.CreateTerrainGameObject(AssetDatabase.LoadAssetAtPath(newAssetPath, TerrainData));
	        		
				   	var split1 = newAssetPath.Split("/"[0]);
				   	var newName = split1[split1.Length-1].Replace(".asset", "");
					var split2 = newName.Split("_"[0]);
					var num = split2[split2.Length-1];
		
	        		terrain.name = terrains[i].name + "_" + num;
	        		terrain.transform.position = terrains[i].transform.position;
	        		terrain.GetComponent(Terrain).Flush();
	        	}
	        }
        }
	}
}