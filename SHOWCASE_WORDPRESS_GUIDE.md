# NodeBook Showcase in WordPress - User Guide

## Overview

This guide explains how to embed NodeBook graph showcases into your WordPress website using the `showcase.html` file. The showcase displays interactive knowledge graphs without requiring user authentication, welcome messages, or privacy banners.

---

## Basic Embedding

### Simple iframe Embed

Add this HTML code to your WordPress page or post (use the **Custom HTML block**):

```html
<iframe src="https://nodebook.materialsqc.ca/showcase.html?graph=Annual_Audit_Program_Planning_Process"
        width="100%" 
        height="800px" 
        frameborder="0">
</iframe>
```

**What this does:**
- Embeds the NodeBook showcase directly into your page
- Automatically loads the specified graph
- No popup messages or prompts
- Fully interactive (users can pan, zoom, click nodes)

---

## URL Parameters

The showcase.html accepts parameters in the URL to control which graph is displayed.

### Basic Syntax
```
https://nodebook.materialsqc.ca/showcase.html?graph=GRAPH_NAME
```

### Available Graphs

Replace `GRAPH_NAME` with any graph file stored in the `graphs/` folder:

| Graph Name | Description |
|------------|-------------|
| `Annual_Audit_Program_Planning_Process` | Annual audit planning workflow |
| `welcome` | Default welcome/tutorial graph |
| *(add your graphs here)* | *(description)* |

### Examples

**Load the welcome graph (default):**
```html
<iframe src="https://nodebook.materialsqc.ca/showcase.html" 
        width="100%" height="800px" frameborder="0">
</iframe>
```

**Load a specific graph:**
```html
<iframe src="https://nodebook.materialsqc.ca/showcase.html?graph=Annual_Audit_Program_Planning_Process" 
        width="100%" height="800px" frameborder="0">
</iframe>
```

---

## WordPress Integration Steps

### Method 1: Custom HTML Block (Recommended)

1. **Edit your WordPress page/post**
2. **Click the (+) button** to add a new block
3. **Search for "Custom HTML"** and select it
4. **Paste the iframe code** into the HTML block
5. **Preview or Publish** your page

### Method 2: Classic Editor

If using the Classic Editor with the "Text" tab:

1. Switch to the **Text** tab (not Visual)
2. Paste the iframe code directly
3. Save/Publish

### Method 3: Page Builder (Elementor, Divi, etc.)

1. Add an **HTML widget** or **Code block**
2. Paste the iframe code
3. Adjust settings as needed

---

## Styling & Customization

### Adjust iframe Height

Change the `height` attribute to fit your content:

```html
<!-- Shorter iframe -->
<iframe src="..." height="600px"></iframe>

<!-- Taller iframe -->
<iframe src="..." height="1000px"></iframe>

<!-- Full viewport height -->
<iframe src="..." height="100vh"></iframe>
```

### Responsive Width

The `width="100%"` makes it responsive. You can also use specific widths:

```html
<!-- Fixed width -->
<iframe src="..." width="800px"></iframe>

<!-- Centered with max-width -->
<div style="max-width: 1200px; margin: 0 auto;">
    <iframe src="..." width="100%"></iframe>
</div>
```

### Remove Border

Already included in the example, but you can also use CSS:

```html
<iframe src="..." 
        frameborder="0" 
        style="border: none;">
</iframe>
```

### Add Rounded Corners

```html
<iframe src="..." 
        style="border: none; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
</iframe>
```

---

## Advanced Examples

### Multiple Graphs on One Page

Display multiple graphs with tabs or sections:

```html
<h3>Project Planning</h3>
<iframe src="https://nodebook.materialsqc.ca/showcase.html?graph=Project_Planning" 
        width="100%" height="600px" frameborder="0">
</iframe>

<h3>Annual Audit Process</h3>
<iframe src="https://nodebook.materialsqc.ca/showcase.html?graph=Annual_Audit_Program_Planning_Process" 
        width="100%" height="600px" frameborder="0">
</iframe>
```

### With Introduction Text

```html
<div style="max-width: 1200px; margin: 0 auto; padding: 20px;">
    <h2>Annual Audit Program Planning Process</h2>
    <p>Explore our comprehensive audit planning workflow. Click on nodes to view details, drag to pan, and scroll to zoom.</p>
    
    <iframe src="https://nodebook.materialsqc.ca/showcase.html?graph=Annual_Audit_Program_Planning_Process" 
            width="100%" 
            height="800px" 
            frameborder="0"
            style="border: none; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    </iframe>
    
    <p><em>Interactive graph - use your mouse to explore.</em></p>
</div>
```

### Fullscreen Section

```html
<div style="width: 100vw; margin-left: calc(-50vw + 50%); height: 100vh; position: relative;">
    <iframe src="https://nodebook.materialsqc.ca/showcase.html?graph=Annual_Audit_Program_Planning_Process" 
            width="100%" 
            height="100%" 
            frameborder="0"
            style="border: none;">
    </iframe>
</div>
```

---

## Adding New Graphs

To add new graphs to the showcase:

### Step 1: Prepare Your Graph

1. Create your graph in NodeBook
2. Export as JSON (File → Save)
3. Note the filename (e.g., `My_New_Graph.json`)

### Step 2: Upload to Server

Upload the JSON file to:
```
https://nodebook.materialsqc.ca/graphs/My_New_Graph.json
```

### Step 3: Verify Upload

Test the file is accessible by visiting:
```
https://nodebook.materialsqc.ca/graphs/My_New_Graph.json
```

You should see the raw JSON content.

### Step 4: Use in WordPress

```html
<iframe src="https://nodebook.materialsqc.ca/showcase.html?graph=My_New_Graph" 
        width="100%" height="800px" frameborder="0">
</iframe>
```

**Note:** Do NOT include `.json` in the graph parameter - it's added automatically.

---

## Troubleshooting

### Issue: Graph Not Loading

**Problem:** Blank screen or error message

**Solutions:**
1. Check the graph file exists at the correct URL
2. Verify the filename is correct (case-sensitive)
3. Make sure the file is in the `graphs/` folder
4. Test the direct URL: `https://nodebook.materialsqc.ca/graphs/YOUR_GRAPH.json`

### Issue: iframe Too Small/Large

**Problem:** Content is cut off or too much white space

**Solutions:**
1. Adjust the `height` attribute
2. Common heights: 600px (small), 800px (medium), 1000px (large)
3. Use browser developer tools to inspect and test

### Issue: Graph Features Not Working

**Problem:** Can't click nodes, drag, or zoom

**Solutions:**
1. Make sure you're not using `pointer-events: none` in CSS
2. Check that the iframe isn't overlapped by other elements
3. Verify the graph JSON is valid

### Issue: Shows Welcome Graph Instead

**Problem:** Always shows the welcome tutorial graph

**Solutions:**
1. Check the URL parameter is correct: `?graph=YOUR_GRAPH`
2. Verify the graph file exists on the server
3. Check browser console for errors (F12)

---

## Best Practices

### Performance

- ✅ Keep graph sizes reasonable (< 200 nodes for best performance)
- ✅ Use appropriate iframe heights to avoid unnecessary scrolling
- ✅ Test on mobile devices

### User Experience

- ✅ Add instructions above the iframe (e.g., "Click nodes to view details")
- ✅ Provide context about what the graph shows
- ✅ Consider adding a download link to the JSON file
- ✅ Use descriptive graph names

### Accessibility

- ✅ Add `title` attribute to iframe:
  ```html
  <iframe src="..." title="Annual Audit Planning Process Graph"></iframe>
  ```
- ✅ Provide alternative text description
- ✅ Ensure adequate color contrast in your graphs

---

## Example: Complete WordPress Page

```html
<!-- Add this to a Custom HTML block in WordPress -->

<div style="max-width: 1400px; margin: 0 auto; padding: 20px;">
    
    <!-- Header -->
    <h1>Annual Audit Program Planning Process</h1>
    
    <!-- Introduction -->
    <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
        <h3>How to Use This Interactive Graph:</h3>
        <ul>
            <li><strong>Click</strong> on any node to view detailed information</li>
            <li><strong>Drag</strong> nodes to rearrange the layout</li>
            <li><strong>Scroll</strong> to zoom in and out</li>
            <li><strong>Hold spacebar + drag</strong> to pan around the canvas</li>
        </ul>
    </div>
    
    <!-- The iframe -->
    <iframe 
        src="https://nodebook.materialsqc.ca/showcase.html?graph=Annual_Audit_Program_Planning_Process" 
        width="100%" 
        height="800px" 
        frameborder="0"
        title="Annual Audit Planning Process - Interactive Graph"
        style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
    </iframe>
    
    <!-- Footer -->
    <div style="margin-top: 20px; padding: 15px; background: #e8f4f8; border-radius: 8px;">
        <p><strong>Note:</strong> This is an interactive visualization. All interactions happen in your browser.</p>
        <p><a href="https://nodebook.materialsqc.ca/graphs/Annual_Audit_Program_Planning_Process.json" download>Download JSON file</a></p>
    </div>
    
</div>
```

---

## Quick Reference

### Basic iframe Template
```html
<iframe src="https://nodebook.materialsqc.ca/showcase.html?graph=GRAPH_NAME"
        width="100%" 
        height="800px" 
        frameborder="0">
</iframe>
```

### File Structure on Server
```
nodebook.materialsqc.ca/
├── showcase.html
├── index.html
├── graphs/
│   ├── Annual_Audit_Program_Planning_Process.json
│   ├── My_Graph.json
│   └── Another_Graph.json
├── js/
└── styles/
```

### URL Pattern
```
https://nodebook.materialsqc.ca/showcase.html?graph=GRAPH_NAME
                                              └─────┬─────┘
                                                    │
                                    Filename without .json extension
```

---

## Support & Resources

- **NodeBook Documentation:** https://nodebook.materialsqc.ca/help.html
- **Source Code:** [Your GitHub repo if public]
- **Issues/Questions:** [Your contact method]

---

## Version History

- **v1.0** - Initial showcase.html release
- **v1.1** - Added support for custom graph parameters

---

**Last Updated:** January 2026
