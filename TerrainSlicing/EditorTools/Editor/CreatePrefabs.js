//Terrain Slicing & Dynamic Loading Kit copyright © 2015 Kyle Gillen. All rights reserved. Redistribution is not allowed.
import System.IO;

class CreatePrefabs extends EditorWindow
{
    //User options/fields
    private var objectsToPrefabricate : GameObject[];
    private var overwrite : boolean;
    static var path : String = "/TerrainSlicing/Resources";
    private var showFoldout : boolean;
	
    private var objectSelections : GameObject[];
	
    //Used for the object selection function
    private var allTerrainsFilled : boolean;
    private var filling : boolean;
    private var needToSelect : boolean;
    private var size1 : int;
    private var size2 : int;
	
    //used for scrolling when the list of objects becomes too long to fit in the editor window
    private var scrollPosition : Vector2;
	
	@MenuItem ("Assets/Dynamic Loading Kit/Create Prefabs")
    static function ShowWindow () {
        var window = EditorWindow.GetWindow (CreatePrefabs);
        window.position = Rect(Screen.width/2 + 300,400,600,300);
    }

    function OnEnable()
    {
        minSize = Vector2(600,395);
		
        if(!Application.isPlaying)
        {
            showFoldout = true;
            size1 = 2;
            size2 = 2;
	 
            overwrite = false;
            filling = false;
            needToSelect = true;
	    	
            objectsToPrefabricate = new GameObject[size1*size2];
	    	
            if(!PlayerPrefs.HasKey("Prefab Save Path"))
            {
                PlayerPrefs.SetString("Prefab Save Path", "/Resources");
                path = "/TerrainSlicing/Resources";
            }
            else
                path = PlayerPrefs.GetString("Prefab Save Path");
        }
    }
	
    function Update()
    {
        if(Application.isPlaying)
        {
            EditorUtility.DisplayDialog("Error", "The Prefab Creation Tool cannot operate in play mode. Exit play mode and reselect Create Prefab Option.", "Close");
            this.Close();
        }
    }
	
    //Our GUI
    function OnGUI()
    {
        GUILayout.Label("Configuration", EditorStyles.boldLabel);
		
        path = EditorGUILayout.TextField(TerrainSlicingKit.LabelDatabase.pathToSavePrefabsLabel, path);
        EditorGUILayout.HelpBox("Example : To save in Assets/Resources folder type /Resources", MessageType.Info);
        if(GUILayout.Button("Set this path as Default Prefab Save Path"))
            SavePath();
        overwrite = EditorGUILayout.Toggle(TerrainSlicingKit.LabelDatabase.overwritePrefabsLabel, overwrite);
        showFoldout = EditorGUILayout.Foldout(showFoldout, TerrainSlicingKit.LabelDatabase.objectsToConvertLabel);
		
        if(showFoldout)
        {
            if(GUILayout.Button(TerrainSlicingKit.LabelDatabase.fillFromSelectionsButtonLabel))
                filling = true;
	
            if(filling)
                needToSelect = FillOtherSelections();
			
            if(objectsToPrefabricate.Length != size1*size2)
            {
                var tempArray = new GameObject[size1*size2];
                for(var i : int = 0; i < size1*size2 ; i++)
					if(objectsToPrefabricate.Length > i)
						tempArray[i] = objectsToPrefabricate[i];
				
				objectsToPrefabricate = tempArray;
                }
            scrollPosition = GUILayout.BeginScrollView(scrollPosition, GUILayout.Width(590), GUILayout.Height(175));
            for(i = 0; i < objectsToPrefabricate.Length; i++)
                objectsToPrefabricate[i] = EditorGUILayout.ObjectField ("Object " + (i+1), objectsToPrefabricate[i], GameObject, true) as GameObject;
            GUILayout.EndScrollView();	
        }
		
        if(GUILayout.Button("Create Prefabs"))
        {
            CreateOtherPrefabs();
            this.Close();
        }
    }
	
	
    function FillOtherSelections() : boolean
    {
        if(needToSelect)
        {
            objectSelections = Selection.gameObjects;
            if(objectSelections.Length != objectsToPrefabricate.Length)
            {
                size1 = 1;
                size2 = objectSelections.Length;
                return false;
            }
        }
        if(objectSelections.Length != objectsToPrefabricate.Length)
        {
            this.ShowNotification(GUIContent("An unknown error occured that really shouldn't have occured. Please contact me immediately!"));
            GUIUtility.keyboardControl = 0; // Added to shift focus to original window rather than the notification
            filling = false;
            return true;
        }
        for(var x : int = 0; x < objectsToPrefabricate.Length; x++)
            objectsToPrefabricate[x] = objectSelections[x];
		
        System.Array.Clear(objectSelections, 0, objectSelections.Length);
        filling = false;
        return true;

        }
	
    function CreateOtherPrefabs()
    {
        var pathToSave : String = Application.dataPath + path;
        if(!Directory.Exists(pathToSave))
            Directory.CreateDirectory(pathToSave);
		
        pathToSave = "Assets" + path;
        if(pathToSave[pathToSave.Length - 1] != '/')
            pathToSave = pathToSave + "/";
								
        if(!overwrite)
        {
            for(var x : int = 0; x < objectsToPrefabricate.Length; x++)
            {
                if(objectsToPrefabricate[x] != null)
                {
                    if(AssetDatabase.LoadAssetAtPath(pathToSave + objectsToPrefabricate[x].name + ".prefab", GameObject))
                    {
                        if(EditorUtility.DisplayDialog("Are you sure?", "The " + objectsToPrefabricate[x].name + " prefab already exists. Do you want to overwrite it?", "Yes", "No"))
                            PrefabUtility.ReplacePrefab(objectsToPrefabricate[x], AssetDatabase.LoadAssetAtPath(pathToSave + objectsToPrefabricate[x].name + ".prefab", GameObject), ReplacePrefabOptions.ConnectToPrefab);
                    }
                    else
                        PrefabUtility.CreatePrefab(pathToSave + objectsToPrefabricate[x].name + ".prefab", objectsToPrefabricate[x], ReplacePrefabOptions.ConnectToPrefab);
					
                    objectsToPrefabricate[x] = null;
                    UnloadUnusedAssets();
                    System.GC.Collect();
                }
            }
        }
        else
        {
            for(x = 0; x < objectsToPrefabricate.Length; x++)
            {
                if(objectsToPrefabricate[x] != null)
                {
                    if(AssetDatabase.LoadAssetAtPath(pathToSave + objectsToPrefabricate[x].name + ".prefab", GameObject))
                        PrefabUtility.ReplacePrefab(objectsToPrefabricate[x], AssetDatabase.LoadAssetAtPath(pathToSave + objectsToPrefabricate[x].name + ".prefab", GameObject), ReplacePrefabOptions.ConnectToPrefab);
                    else
                        PrefabUtility.CreatePrefab(pathToSave + objectsToPrefabricate[x].name + ".prefab", objectsToPrefabricate[x], ReplacePrefabOptions.ConnectToPrefab);
					
                    objectsToPrefabricate[x] = null;
                    UnloadUnusedAssets();
                    
                    System.GC.Collect();
                }
            }
        }
    }
			
    function UnloadUnusedAssets()
    {
        #if UNITY_4_0 || UNITY_4_0_1 || UNITY_4_1 || UNITY_4_2 || UNITY_4_3 || UNITY_4_5 || UNITY_4_6
            EditorUtility.UnloadUnusedAssets();
        #else
            EditorUtility.UnloadUnusedAssetsImmediate();
        #endif
    }
    
	
	function SavePath()
	{
		PlayerPrefs.SetString("Prefab Save Path", path);
	}
}//End the MakeTerrain Class