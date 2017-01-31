using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class PanoramaGeneration : MonoBehaviour {

    public GameObject slices;
    //private GameObject child;
    public KeyCode key = KeyCode.KeypadEnter;
    private int x = 0, y = 0, intx = 10, inty = 10, count=0, previousCount = 0;

	// Use this for initialization
	void Start () {


        for (int i=0; i < 16; i++)
        {
            for (int j=0; j < 16; j++)
            {

                slices.transform.FindChild(string.Format("Slice_x{0}_y{1}", i, j)).gameObject.SetActive(false);
                print(string.Format("disabiling x{0}_y{1}",i,j));
            }
        }
    }
	
	// Update is called once per frame
	void Update () {

        //slices.transform.FindChild(string.Format("Slice_x{0}_y{0}",i,j)).gameObject.SetActive(false);

        if (Input.GetKeyDown("space"))
        {
            //enabledloop
            if (count == 17)
            {
                count = 1;
                if (inty == 15)
                {
                    if (intx == 15)
                    {
                        inty = 0;
                        intx = 0;
                    }else
                    {
                        intx++;
                        inty = 0;
                    }
                } else
                {
                    inty++;
                }
            }

            //enable
            for (int i=intx-count-1; i<= count + 1+intx; i++)
            {
                for (int j=inty-count-1; j <= count + 1+inty; j++)
                {
                  //  print("enable: "+ string.Format("Slice_x{0}_y{1}", i, j));
                    if (slices.transform.FindChild(string.Format("Slice_x{0}_y{1}", i, j))!=null)
                    {
                        slices.transform.FindChild(string.Format("Slice_x{0}_y{1}", i, j)).gameObject.SetActive(true);
                    }
                    
                }
            }
            //disable

           // if (count - 2 > 0)
            //{
                for (int i=intx-count; i<=count+intx; i++)
                {
                    for (int j=inty-count; j <= count+inty; j++) { 
                     //   print("disable: "+ string.Format("Slice_x{0}_y{1}", i, j));
                    if (slices.transform.FindChild(string.Format("Slice_x{0}_y{1}", i, j)) != null)
                        slices.transform.FindChild(string.Format("Slice_x{0}_y{1}", i, j)).gameObject.SetActive(false);
                    }
                }
           // }

            count++;
           // count++;
        
        print("intx: "+intx+"int y: "+inty+"count: "+count);
           // slices.transform.FindChild(string.Format("Slice_x{0}_y{0}", x, y)).gameObject.SetActive(false);
        }

    }
}
