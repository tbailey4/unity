//Terrain Slicing & Dynamic Loading Kit copyright © 2015 Kyle Gillen. All rights reserved. Redistribution is not allowed.

#pragma strict
import System;

class SliceTerrain extends EditorWindow
{
	@MenuItem ("Terrain/Terrain Slicing Kit/Slice Terrain (Use Slice Config File Instead)")
    static function ShowWindow () 
    {
        var window = EditorWindow.GetWindow (SliceTerrain);
        window.position = Rect(Screen.width/2 + 300,400,600,300);  
        window.minSize = Vector2(660, 500); 
        window.Show();
    }
    
    function OnGUI()
	{
		EditorGUILayout.HelpBox("Slicing is now performed exclusively via Slice Configuration Files. Create a file via Terrain -> Terrain Slicing Kit -> Create Slice Configuration File, " +
		"and then select the file in the project hierarchy (it should be in whatever folder was selected, or the Assets folder if no folder was selected).", MessageType.Info);
	}
}

/*
Old Logic
class SliceTerrain extends EditorWindow
{
    class CustomTreeDataHandler extends TerrainSlicingKit.TreeDataHandler
    {
        public function RetrievePosition(treeInstance : TreeInstance) : Vector3
        {
            return treeInstance.position;
        }

        public function GetTreePrototypeIndex(treeInstance : TreeInstance) : int
        {
            return treeInstance.prototypeIndex;
        }

        public function AddTreeInstance(slice : Terrain, treeInstanceToUse : TreeInstance, 
            treePosition : Vector3, treePrototypeIndex : int)
        {
            var newTree = new TreeInstance();
            newTree.prototypeIndex = treePrototypeIndex;
            newTree.position = treePosition;
            newTree.widthScale = treeInstanceToUse.widthScale;
            newTree.heightScale = treeInstanceToUse.heightScale;
            newTree.color = treeInstanceToUse.color;
            newTree.lightmapColor = treeInstanceToUse.lightmapColor;
            slice.AddTreeInstance(newTree);
        }

        public function GetNewTreeInstance() : TreeInstance
        {
            return new TreeInstance();
        }
    }

	private var sliceConfigurationFile : TerrainSlicingKit.SliceConfigurationFile;
	private var sliceConfigurationFileDisplayer : TerrainSlicingKit.SliceConfigurationFileDisplayer;
	
	private var manualConfiguration : TerrainSlicingKit.SliceConfiguration;
	private var manualConfigurationEditor : TerrainSlicingKit.SliceConfigurationEditor;
	
	private var configurationType : int = 1;
	private var configurationTypeOptions : String[];
	
	@MenuItem ("Terrain/Terrain Slicing Kit/Slice Terrain")
    static function ShowWindow () 
    {
        var window = EditorWindow.GetWindow (SliceTerrain);
        window.position = Rect(Screen.width/2 + 300,400,600,300);  
        window.minSize = Vector2(660, 500); 
        window.Show();
    }
    
    function OnEnable()
    {
    	configurationTypeOptions = new String[2];
    	configurationTypeOptions[0] = "Configure using Slice Configuration File";
    	configurationTypeOptions[1] = "Configure Manually";
    	
    	if(manualConfiguration == null)
    	{
    		manualConfiguration = new TerrainSlicingKit.SliceConfiguration();
    		manualConfigurationEditor = new TerrainSlicingKit.SliceConfigurationEditor(manualConfiguration, true);
    	}
    }
    
    function OnFocus()
    {
    	if(configurationType == 1)
    	{
    		SceneView.onSceneGUIDelegate -= manualConfigurationEditor.OnSceneGUI;
    		manualConfigurationEditor.OnFocus();
     		SceneView.onSceneGUIDelegate += manualConfigurationEditor.OnSceneGUI;
    	}
    }
    
    function OnDestroy()
    {
    	if(configurationType == 1)
    		SceneView.onSceneGUIDelegate -= manualConfigurationEditor.OnSceneGUI;
    }

	function OnInspectorUpdate()
	{
		if(Application.isPlaying)
		{
			EditorUtility.DisplayDialog("Error", "The Slice Terrain Tool cannot operate in play mode. Exit play mode and reselect Slicing Option.", "Close");
			this.Close();
		}
		else
			Repaint();
	}


//	*****GUI Functions Start*****
	function OnGUI()
	{
		GUILayout.Label ("Configuration", EditorStyles.boldLabel);
		EditorGUILayout.Space();
		
		var configurationTypeTemp : int = EditorGUILayout.Popup("Configuration Method", configurationType, configurationTypeOptions);	
		
		if(configurationType != configurationTypeTemp)
		{
			configurationType = configurationTypeTemp;
			if(configurationType == 0)
				SceneView.onSceneGUIDelegate -= manualConfigurationEditor.OnSceneGUI;
			else
				SceneView.onSceneGUIDelegate += manualConfigurationEditor.OnSceneGUI;
		}
		
		if(configurationType == 0)
			DrawSliceConfigurationFileOptions();
		else
		{
			DrawManualConfigurationOptions();
			if(GUILayout.Button("Create Slice Configuration File From These Settings"))
			{
				CreateSliceConfigurationFileFromManualSettings();
				GUILayout.Button("Slice Terrain(s)");
				return;
			}
		}
			
		if(GUILayout.Button("Slice Terrain(s)"))
		{
			if(VerifyConfiguration())
				Slice();
		}
	}
	
	
	private function DrawSliceConfigurationFileOptions()
	{
		var tempSliceConfigurationFile : TerrainSlicingKit.SliceConfigurationFile = EditorGUILayout.ObjectField (sliceConfigurationFileLabel, sliceConfigurationFile, TerrainSlicingKit.SliceConfigurationFile, false) as TerrainSlicingKit.SliceConfigurationFile;
		if(tempSliceConfigurationFile != sliceConfigurationFile)
		{			
			sliceConfigurationFile = tempSliceConfigurationFile;
			if(sliceConfigurationFile == null)
				sliceConfigurationFileDisplayer = null;
			else
				sliceConfigurationFileDisplayer = new TerrainSlicingKit.SliceConfigurationFileDisplayer(sliceConfigurationFile);
		}
		
		if(sliceConfigurationFile == null)
			DrawSliceConfigurationFileNotPresentOptions();
		else
			DrawSliceConfigurationFilePresentOptions();			
	}
	
	private function DrawSliceConfigurationFileNotPresentOptions()
	{
		EditorGUILayout.BeginHorizontal();
		if(GUILayout.Button("Create New Configuration File"))
		{
			sliceConfigurationFile = TerrainSlicingKit.SliceConfigurationFileEditor.CreateSliceConfigurationFileInAssetsFolder();
			sliceConfigurationFileDisplayer = new TerrainSlicingKit.SliceConfigurationFileDisplayer(sliceConfigurationFile);	
		}
			
		EditorGUILayout.LabelField("File will be created directly in Assets folder");
		EditorGUILayout.EndHorizontal();
	}
	
	private function DrawSliceConfigurationFilePresentOptions()
	{
		sliceConfigurationFileDisplayer.DrawGUI();
		if(sliceConfigurationFile.SliceConfiguration.HasTerrainSample)
		{
			useOtherTerrain = EditorGUILayout.Toggle(useOtherTerrainLabel, useOtherTerrain);
			if(useOtherTerrain)
			{
				var otherSampleTerrainTemp : Terrain = EditorGUILayout.ObjectField("Alternate Terrain", otherSampleTerrain, Terrain, true) as Terrain;
				if(otherSampleTerrainTemp != otherSampleTerrain)
				{
					//if(otherSampleTerrainTemp.DoesTerrainHaveSameSettings(sliceConfigurationFile))
				
				}
			}
		}
		else
		{
			EditorGUILayout.Toggle(useOtherTerrainLabel, true);
			otherSampleTerrain = EditorGUILayout.ObjectField("Alternate Terrain", otherSampleTerrain, Terrain, true) as Terrain;
		}
	}
	
	private function DrawManualConfigurationOptions()
	{
		EditorGUILayout.HelpBox("This configuration info will be used for this slice only; it will not be saved! If you want to save common settings for use with multiple slices, create a " +
		"Slice Configuration File (Assets -> Terrain Slice Kit -> Create Slice Configuration File, or right click on a folder and select Terrain Slice Kit -> Create Slice Configuration File).", MessageType.Info);
		
		manualConfigurationEditor.DrawGUI();
	}
	
	private function CreateSliceConfigurationFileFromManualSettings()
	{
		sliceConfigurationFile = TerrainSlicingKit.SliceConfigurationFileEditor.CreateSliceConfigurationFileInAssetsFolder(manualConfiguration);
		sliceConfigurationFileDisplayer = new TerrainSlicingKit.SliceConfigurationFileDisplayer(sliceConfigurationFile);	
	
	}
	
	private function VerifyConfiguration() : boolean
	{
		var errorsExist = false;
		var errors = "Please fix the following errors:";
		
		if(configurationType == 0 && sliceConfigurationFile == null)
		{
			errors += "\n\nNo Slice Configuration File was specified!";
			errorsExist = true;
		}
		else if(configurationType == 0 && sliceConfigurationFile != null)
		{
			if(!sliceConfigurationFile.SliceConfiguration.AllFoldersSpecified)
			{
				errors += "\n\nOne or more save folders have not been specified!";
				errorsExist = true;
			}
			
			if(!sliceConfigurationFile.SliceConfiguration.AllOutputNamesSpecified)
			{
				errors += "\n\nOne or more output names have not been specified!";
				errorsExist = true;
			}
			
			if((!sliceConfigurationFile.SliceConfiguration.HasTerrainSample && otherSampleTerrain == null) || (useOtherTerrain && otherSampleTerrain == null))
			{
				errors += "\n\nNo Terrain has been provided!";
				errorsExist = true;
			}
		}
		else
		{
			if(!manualConfiguration.AllFoldersSpecified)
			{
				errors += "\n\nOne or more save folders have not been specified!";
				errorsExist = true;
			}
			
			if(!manualConfiguration.AllOutputNamesSpecified)
			{
				errors += "\n\nOne or more output names have not been specified!";
				errorsExist = true;
			}
			
			if(!manualConfiguration.HasTerrainSample)
			{
				errors += "\n\nNo Terrain has been provided!";
				errorsExist = true;
			}
		}
		
		
		if(errorsExist)
		{	
			EditorUtility.DisplayDialog("Error", errors, "OK");
			return false;
		}
		else
			return true;
	}
	
	
	private function Slice()
	{
		var sliceConfigurationToUse : TerrainSlicingKit.SliceConfiguration;
		if(configurationType == 0)
		{
			if(!sliceConfigurationFile.SliceConfiguration.HasTerrainSample || useOtherTerrain)
				sliceConfigurationToUse = new TerrainSlicingKit.SliceConfiguration(sliceConfigurationFile.SliceConfiguration, otherSampleTerrain);
			else
				sliceConfigurationToUse = new TerrainSlicingKit.SliceConfiguration(sliceConfigurationFile.SliceConfiguration);
		}
		else
			sliceConfigurationToUse = new TerrainSlicingKit.SliceConfiguration(manualConfiguration);
		
		var slicer = new TerrainSlicingKit.Slicer(sliceConfigurationToUse, new VersionDependentDataCopier());
		
		var additionalDetails : String;
		try
		{
			additionalDetails = slicer.InitializeSlice(new CustomTreeDataHandler());
		}
		catch(exception)
		{
			var sliceException = exception as TerrainSlicingKit.SliceException;
			if(sliceException != null)
			{
				EditorUtility.DisplayDialog("Slicing Error", sliceException.ReasonSliceFailed, "OK");
				return;
			}
			
			var cancelException = exception as TerrainSlicingKit.SliceCanceledException;
			if(cancelException != null)
				return;
			
			Close();
			throw exception;
		}
		
		if(additionalDetails != "")
			Debug.Log(additionalDetails);
			
		Close();
	}
	
	
	private var sliceConfigurationFileLabel : GUIContent = new GUIContent("Slice Configuration File", "The Slice Configuration File you'd like to use for this Terrain Slice");
	
	private var useOtherTerrainLabel : GUIContent = new GUIContent("Use Alternate Terrain", "Enabling this option will allow you to select a different terrain than the one in your Slice Configuration File.");


	#if !UNITY_3_5
	private class VersionDependentDataCopier extends System.Object implements TerrainSlicingKit.UnityVersionDependentDataCopier
	{		
		function CopySplatNormalMapIfAvailable(copyFrom : SplatPrototype, copyTo : SplatPrototype)
		{
			copyTo.normalMap = copyFrom.normalMap;
		}
		
		function CopyMaterialTemplateIfAvailable(copyFrom : Terrain, copyTo : Terrain)
		{
			copyTo.materialTemplate = copyFrom.materialTemplate;
		}
		
		function DeactivateGameObject(gameObject : GameObject)
		{
			gameObject.SetActive(false);
		}		
	}
	#else
	private class VersionDependentDataCopier extends System.Object implements TerrainSlicingKit.UnityVersionDependentDataCopier
	{	
		function CopySplatNormalMapIfAvailable(copyFrom : SplatPrototype, copyTo : SplatPrototype){}
		function CopyMaterialTemplateIfAvailable(copyFrom : Terrain, copyTo : Terrain){}
		function DeactivateGameObject(gameObject : GameObject)
		{
			gameObject.SetActiveRecursively(false);
		}
	}
	#endif
		}
        */