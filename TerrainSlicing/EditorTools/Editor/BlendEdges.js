//Terrain Slicing & Dynamic Loading Kit copyright © 2015 Kyle Gillen. All rights reserved. Redistribution is not allowed.
//import TerrainSlicingKit.PlayModeUtilities;
//import SelectionFiller = TerrainSlicingKit.PlayModeUtilities.SelectionFiller;
class BlendEdges extends EditorWindow
{
	//Use Options/fields
	private var baseTerrain : Terrain;
	private var columns : int;
	static var effectedRegionWidth : int;
	private var rows : int;
	private var showFoldout : boolean;
	static var terrainSelections : Terrain[,];
	
	//Stores the alphamaps so the user can undo the blending operation
	static var backupAlphaMap : TerrainSlicingKit.PlayModeUtilities.AlphamapBackupController;
	
	//Other class member variables
	private var maxWidth : int;
	private var scrollPosition : Vector2;
	
	@MenuItem ("Terrain/Terrain Slicing Kit/Blend Edges")
    static function ShowWindow () {
        var window = EditorWindow.GetWindow (BlendEdges);
        window.position = Rect(Screen.width/2 + 300,400,600,300); 
    }

	function OnEnable()
	{
		minSize = Vector2(600,380);
		
		if(!Application.isPlaying)
		{
			var selection : GameObject[] = Selection.gameObjects;
			var selectedTerrain : Terrain;
			if(selection.Length != 0)
				selectedTerrain = selection[0].GetComponent(Terrain);
				
			if(terrainSelections == null)
			{
				rows = 1;
				columns = 1;
				terrainSelections = new Terrain[1, 1];
				if(selectedTerrain != null)
				{
					baseTerrain = selectedTerrain;
					terrainSelections[0, 0] = selectedTerrain;
				}
				else
					baseTerrain = null;			
			}
			else
			{
				if(selectedTerrain != null && selectedTerrain != terrainSelections[0, 0])
				{
					rows = 1;
					columns = 1;
					baseTerrain = selectedTerrain;
					terrainSelectoins = new Terrain[1, 1];
					terrainSelections[0, 0] = selectedTerrain;
				}
				else if(selectedTerrain == null || (selectedTerrain != null && selectedTerrain == terrainSelections[0, 0]))
				{
					rows = terrainSelections.GetLength(0);
					columns = terrainSelections.GetLength(1);
					baseTerrain = terrainSelections[0, 0];
				}
			}
	    		
	    	showFoldout = true;
	    	
	    	if(baseTerrain != null)
	    		maxWidth = maxWidth = baseTerrain.terrainData.heightmapResolution/2;
	    	else
	    		maxWidth = -1;
	    }
	}
	
	function Update()
	{
		if(Application.isPlaying)
		{
			EditorUtility.DisplayDialog("Error", "The Blend Edges Tool cannot operate in play mode. Exit play mode and reselect Blend Edges Option.", "Close");
			this.Close();
		}
	}
	
	//Our GUI
	function OnGUI()
	{
		GUILayout.Label ("Configuration", EditorStyles.boldLabel);
		EditorGUILayout.HelpBox("This tool blends both the heightmap and alphamaps of a terrain group. It is outdated and unoptomized, however, " +
		"so I suggest using the Tileable Terrain Maker Component instead (Components -> Tileable Terrain Maker).", MessageType.Info);
		baseTerrain = EditorGUILayout.ObjectField (TerrainSlicingKit.LabelDatabase.baseTerrainLabel, baseTerrain, Terrain, true) as Terrain;
		if(baseTerrain == null)
			GUILayout.Label("You must provide a base terrain in order to proceed.");
		else
		{
			//use -1 to indicate the maxWidth hasn't been set yet
			if(maxWidth == -1)
				maxWidth = baseTerrain.terrainData.heightmapResolution/2;
			effectedRegionWidth = EditorGUILayout.IntSlider(TerrainSlicingKit.LabelDatabase.effectedRegionLabel, effectedRegionWidth, 1, maxWidth);
			
			columns = EditorGUILayout.IntField(TerrainSlicingKit.LabelDatabase.columnsLabel, columns);
			rows = EditorGUILayout.IntField(TerrainSlicingKit.LabelDatabase.rowsLabel, rows);
			
			showFoldout = EditorGUILayout.Foldout(showFoldout, TerrainSlicingKit.LabelDatabase.terrainsInGroupLabel);
			
			var row : int;
			var col : int;
			if(showFoldout)
			{
				if(GUILayout.Button("Auto Fill From Scene"))
					FillSelections();
				
				var rowsOfSelectedTerrains : int = terrainSelections.GetLength(0);
				var columnsOfSelectedTerrains : int = terrainSelections.GetLength(1);
				
				if(rowsOfSelectedTerrains != rows || columnsOfSelectedTerrains != columns)
				{
					var tempArray : Terrain[,] = new Terrain[rows, columns];
					for(row = 0; row < rows; row++)
					{
						for(col = 0; col < columns; col++)
						{
							if(row < rowsOfSelectedTerrains && col < columnsOfSelectedTerrains)
								tempArray[row, col] = terrainSelections[row, col];
						}
					}
					
					terrainSelections = tempArray;
				}
				scrollPosition = GUILayout.BeginScrollView(scrollPosition, GUILayout.Width(590), GUILayout.Height(175));
				for(row = 1; row <= rows; row++)
				{
					for(col = 1; col <= columns; col++)
						terrainSelections[row-1, col-1] = EditorGUILayout.ObjectField ("Terrain_" + row + "_" + col, terrainSelections[row-1, col-1], Terrain, true) as Terrain;
				}
				GUILayout.EndScrollView();
			}
		}				
	}//End the OnGUI function
	
	function FillSelections()
	{
		var selectionFiller : TerrainSlicingKit.SelectionFiller = new TerrainSlicingKit.SelectionFiller();
		var terrains : Terrain[,];
		
		terrains = selectionFiller.FillSelections_NormalVersion(baseTerrain.transform, rows, columns);
		if(terrains.Length != terrainSelections.Length)
		{
			EditorUtility.DisplayDialog("Error", "The number of terrains found does not match the expected number of terrains. Did you input the correct number of rows/columns?", "OK");
			return;
		}
		
		if(terrains != null)
			terrainSelections = terrains;
		else
			EditorUtility.DisplayDialog("Error", "No terrains were found.", "OK");
	}
}//End the MakeTerrain Class