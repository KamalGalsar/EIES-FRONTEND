// Frontend/src/utils/graphExport.ts
import { toPng } from 'html-to-image';
import download from 'downloadjs';
import { getRectOfNodes, getTransformForBounds } from 'reactflow';

/**
 * Captures the entire React Flow graph (all nodes) as a PNG image.
 * @param nodes The current array of nodes in the graph
 * @param fileName The name of the file to save
 */
export const exportGraphAsPng = async (nodes: any[], fileName: string = 'EIES-Graph-Export.png') => {
  const element = document.querySelector('.react-flow__viewport') as HTMLElement;
  if (!element || nodes.length === 0) {
    console.error('Export failed: Could not find graph element or no nodes exist.');
    return;
  }

  try {
    // 1. Calculate the bounding box of all nodes
    const nodesBounds = getRectOfNodes(nodes);
    
    // 2. Set the desired image dimensions (high res)
    const width = nodesBounds.width + 100; // Add padding
    const height = nodesBounds.height + 100;
    
    // 3. Capture the viewport but force it to look at the entire node bounds
    // We use a scale of 2 for high density/retina quality
    const dataUrl = await toPng(element, {
      backgroundColor: '#0B1220',
      width: width,
      height: height,
      style: {
        width: `${width}px`,
        height: `${height}px`,
        // This is the magic part: it resets the internal "camera" 
        // to cover exactly the area where the nodes are.
        transform: `translate(${-nodesBounds.x + 50}px, ${-nodesBounds.y + 50}px) scale(1)`,
      },
      cacheBust: true,
      pixelRatio: 2,
    });
    
    download(dataUrl, fileName);
  } catch (err) {
    console.error('Error exporting graph:', err);
  }
};
