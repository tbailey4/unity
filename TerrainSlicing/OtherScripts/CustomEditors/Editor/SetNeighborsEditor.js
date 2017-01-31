//Terrain Slicing & Dynamic Loading Kit copyright © 2012 Kyle Gillen. All rights reserved. Redistribution is not allowed.
#pragma strict

@CustomEditor(SetNeighbors)
class SetNeighborsEditor extends Editor
{
    var targetScript : SetNeighbors;

	private var terrainsProp : SerializedProperty;
	private var rowsProp : SerializedProperty;
    private var columnsProp : SerializedProperty;
    private var showFoldoutProp : SerializedProperty;
    private var emptyLocationsProp : SerializedProperty;

	function OnEnable()
	{
	    targetScript = target as SetNeighbors;
	    var gO : GameObject = targetScript.transform.gameObject;
	    var baseTerrain : Terrain = gO.GetComponent(Terrain);
	    if(baseTerrain == null)
	    {
	        EditorUtility.DisplayDialog("Error", "This script only works with terrains!", "OK");
	        DestroyImmediate(targetScript);
	    }

	    terrainsProp = serializedObject.FindProperty("terrains");
	    rowsProp = serializedObject.FindProperty("rows");
	    columnsProp = serializedObject.FindProperty("columns");
	    showFoldoutProp = serializedObject.FindProperty("showFoldout");
	    emptyLocationsProp = serializedObject.FindProperty("emptyLocations");

	    if(terrainsProp.arraySize == 0)
	    {
	        terrainsProp.arraySize = rowsProp.intValue * columnsProp.intValue;
	        terrainsProp.GetArrayElementAtIndex(0).objectReferenceValue = baseTerrain;
	    }

	    serializedObject.ApplyModifiedProperties();
	}
	
        function OnInspectorGUI()
        {
            serializedObject.Update();

            EditorGUILayout.PropertyField(rowsProp, TerrainSlicingKit.LabelDatabase.columnsLabel);
            EditorGUILayout.PropertyField(columnsProp, TerrainSlicingKit.LabelDatabase.rowsLabel);
		
            showFoldoutProp.boolValue = EditorGUILayout.Foldout(showFoldoutProp.boolValue, TerrainSlicingKit.LabelDatabase.autoFillLabel);
		
            if(showFoldoutProp.boolValue)
            {
                EditorGUILayout.PropertyField(emptyLocationsProp, TerrainSlicingKit.LabelDatabase.emptyLocationsLabel);
                if(GUILayout.Button("Auto Fill Terrains"))
                    FillSelections(emptyLocationsProp.boolValue);
				
                if(rowsProp.intValue * columnsProp.intValue != terrainsProp.arraySize)
                    terrainsProp.arraySize = rowsProp.intValue * columnsProp.intValue;

                EditorGUILayout.PropertyField(terrainsProp, true);	
            }

            serializedObject.ApplyModifiedProperties();
        }
	
        function FillSelections(emptyLocationsExist : boolean)
            {
                var selectionFiller : TerrainSlicingKit.SelectionFiller = new TerrainSlicingKit.SelectionFiller();
                var terrains : Terrain[,];
		
                if(emptyLocationsExist)
                    terrains = selectionFiller.FillSelections_EmptyVersion(targetScript.transform, rowsProp.intValue, columnsProp.intValue);
                else
                    terrains = selectionFiller.FillSelections_NormalVersion(targetScript.transform, rowsProp.intValue, columnsProp.intValue);
		
                if(terrains != null)
                {
                    var terrains1DArray = TerrainSlicingKit.EditorTerrainTools.Convert2DTerrainArrayTo1DArray(terrains);
                    terrainsProp.arraySize = terrains1DArray.Length;
                    for(var i : int = 0; i < terrains1DArray.Length; i++)
                        terrainsProp.GetArrayElementAtIndex(i).objectReferenceValue = terrains1DArray[i];
                    }
                else
                    EditorUtility.DisplayDialog("Error", "No terrains were found.", "OK");
            }
        }

