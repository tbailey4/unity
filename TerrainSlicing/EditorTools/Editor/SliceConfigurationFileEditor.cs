//Terrain Slicing & Dynamic Loading Kits copyright © 2012 Kyle Gillen. All rights reserved. Redistribution is not allowed.
namespace TerrainSlicingKit
{
    using System.IO;
    using UnityEditor;
    using UnityEngine;

    [CustomEditor(typeof(SliceConfigurationFile))]
    public class SliceConfigurationFileEditor : Editor
    {
        SliceConfigurationEditor editor;

        void OnEnable()
        {
            if(editor == null)
                editor = new SliceConfigurationEditor(serializedObject);
            SceneView.onSceneGUIDelegate += editor.OnSceneGUI;
        }

        void OnDisable()
        {
            SceneView.onSceneGUIDelegate -= editor.OnSceneGUI;
        }

        public override void OnInspectorGUI()
        {
            editor.OnInspectorGUI();
            SliceConfigurationFile sliceConfigurationFile = (SliceConfigurationFile)serializedObject.targetObject;
            if (sliceConfigurationFile.SliceConfiguration.HasTerrainSample)
            {
                if (!Application.isPlaying && GUILayout.Button("Initiate Slice") && VerifyConfiguration(sliceConfigurationFile))
                {
                    if (SceneView.lastActiveSceneView.orthographic || EditorUtility.DisplayDialog("Warning", "Scene View not in orthographic mode. Slicing Grid may not accurately represent area to slice. Do " +
                "you wish to Proceed?", "Proceed"))
                    {
                        Slice(sliceConfigurationFile);
                    }
                }
            }
        }

        bool VerifyConfiguration(SliceConfigurationFile sliceConfigurationFile)
        {
            var errorsExist = false;
            var errors = "Please fix the following errors:";

            if (!sliceConfigurationFile.SliceConfiguration.AllFoldersSpecified)
            {
                errors += "\n\nOne or more save folders have not been specified!";
                errorsExist = true;
            }

            if (!sliceConfigurationFile.SliceConfiguration.AllOutputNamesSpecified)
            {
                errors += "\n\nOne or more output names have not been specified!";
                errorsExist = true;
            }

            if (errorsExist)
            {
                EditorUtility.DisplayDialog("Error", errors, "OK");
                return false;
            }
            else
                return true;
        }

        void Slice(SliceConfigurationFile sliceConfigurationFile)
        {
            SliceConfiguration sliceConfigurationToUse = new SliceConfiguration(sliceConfigurationFile.SliceConfiguration);

            var slicer = new Slicer(sliceConfigurationToUse, new VersionDependentDataCopier());

            string additionalDetails;
            try
            {
                additionalDetails = slicer.InitializeSlice(new CustomTreeDataHandler());
            }
            catch (System.Exception exception)
            {
                SliceException sliceException = exception as SliceException;
                if (sliceException != null)
                {
                    EditorUtility.DisplayDialog("Slicing Error", sliceException.ReasonSliceFailed, "OK");
                    return;
                }

                SliceCanceledException cancelException = exception as SliceCanceledException;
                if (cancelException != null)
                    return;

                throw exception;
            }

            if (additionalDetails != "")
                Debug.Log(additionalDetails);
        }

        [MenuItem("Terrain/Terrain Slicing Kit/Create Slice Configuration File")]
        public static void CreateSliceConfigurationFileInSelectedFolder1()
        {
            EditorExtensions.GenerateScriptableObjectAssetAtSelectedFolder<SliceConfigurationFile>("SliceConfigurationFile.asset");
        }

        [MenuItem("Assets/Terrain Slicing Kit/Create Slice Configuration File")]
        public static void CreateSliceConfigurationFileInSelectedFolder2()
        {
            EditorExtensions.GenerateScriptableObjectAssetAtSelectedFolder<SliceConfigurationFile>("SliceConfigurationFile.asset");
        }
    }

#if UNITY_4_0 || UNITY_4_0_1 || UNITY_4_1 || UNITY_4_2 || UNITY_4_3
    [System.Serializable]
    public sealed class VersionDependentDataCopier : UnityVersionDependentDataCopier
    {
        public sealed override void CopyAdditionalSplatSettings(SplatPrototype copyFrom, SplatPrototype copyTo){ }

        public sealed override void CopyOtherSettings(Terrain copyFrom, Terrain copyTo){ }
    }
#elif UNITY_4_5
    [System.Serializable]
    public sealed class VersionDependentDataCopier : UnityVersionDependentDataCopier
    {
        public sealed override void CopyAdditionalSplatSettings(SplatPrototype copyFrom, SplatPrototype copyTo){ }

        public sealed override void CopyOtherSettings(Terrain copyFrom, Terrain copyTo)
        { 
            copyTo.collectDetailPatches = copyFrom.collectDetailPatches;
        }
    }
#else
    [System.Serializable]
	public sealed class VersionDependentDataCopier : UnityVersionDependentDataCopier
	{	
		public sealed override void CopyAdditionalSplatSettings(SplatPrototype copyFrom, SplatPrototype copyTo)
        {
            copyTo.metallic = copyFrom.metallic;
        }

		public sealed override void CopyOtherSettings(Terrain copyFrom, Terrain copyTo)
        {
            copyTo.bakeLightProbesForTrees = copyFrom.bakeLightProbesForTrees;
            copyTo.collectDetailPatches = copyFrom.collectDetailPatches;
            copyTo.materialType = copyFrom.materialType;
            copyTo.reflectionProbeUsage = copyFrom.reflectionProbeUsage;
            copyTo.legacySpecular = copyFrom.legacySpecular;
            copyTo.legacyShininess = copyFrom.legacyShininess;
            copyTo.drawHeightmap = copyFrom.drawHeightmap;
            copyTo.drawTreesAndFoliage = copyFrom.drawTreesAndFoliage;
        }
	}
#endif

#if UNITY_4_0 || UNITY_4_0_1 || UNITY_4_1 || UNITY_4_2 || UNITY_4_3 || UNITY_4_5 || UNITY_4_6
    [System.Serializable]
    public sealed class CustomTreeDataHandler : TreeDataHandler
    {
        public sealed override Vector3 RetrievePosition(TreeInstance treeInstance)
        {
            return treeInstance.position;
        }

        public sealed override int GetTreePrototypeIndex(TreeInstance treeInstance)
        {
            return treeInstance.prototypeIndex;
        }

        public sealed override void AddTreeInstance(Terrain slice, TreeInstance treeInstanceToUse,
            Vector3 treePosition, int treePrototypeIndex)
        {
            TreeInstance newTree = new TreeInstance();
            newTree.prototypeIndex = treePrototypeIndex;
            newTree.position = treePosition;
            newTree.widthScale = treeInstanceToUse.widthScale;
            newTree.heightScale = treeInstanceToUse.heightScale;
            newTree.color = treeInstanceToUse.color;
            newTree.lightmapColor = treeInstanceToUse.lightmapColor;
            slice.AddTreeInstance(newTree);
        }
    }
    #else
    [System.Serializable]
    public sealed class CustomTreeDataHandler : TreeDataHandler
    {
        public sealed override Vector3 RetrievePosition(TreeInstance treeInstance)
        {
            return treeInstance.position;
        }

        public sealed override int GetTreePrototypeIndex(TreeInstance treeInstance)
        {
            return treeInstance.prototypeIndex;
        }

        public sealed override void AddTreeInstance(Terrain slice, TreeInstance treeInstanceToUse,
            Vector3 treePosition, int treePrototypeIndex)
        {
            TreeInstance newTree = new TreeInstance();
            newTree.prototypeIndex = treePrototypeIndex;
            newTree.position = treePosition;
            newTree.widthScale = treeInstanceToUse.widthScale;
            newTree.heightScale = treeInstanceToUse.heightScale;
            newTree.color = treeInstanceToUse.color;
            newTree.lightmapColor = treeInstanceToUse.lightmapColor;

            //new property in Unity 5
            newTree.rotation = treeInstanceToUse.rotation;
            slice.AddTreeInstance(newTree);
        }
    }
    #endif
}