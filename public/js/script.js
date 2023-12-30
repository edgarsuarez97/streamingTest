// File Upload
// 
function ekUpload(){
    function Init() {
  
  
      var fileSelect    = document.getElementById('file-upload'),
          fileDrag      = document.getElementById('file-drag');
  
      fileSelect.addEventListener('change', fileSelectHandler, false);
      fileDrag.addEventListener('dragover', fileDragHover, false);
      fileDrag.addEventListener('dragleave', fileDragHover, false);
      fileDrag.addEventListener('drop', fileSelectHandler, false);
      
    }
  
    function fileDragHover(e) {
      var fileDrag = document.getElementById('file-drag');
  
      e.stopPropagation();
      e.preventDefault();
  
      fileDrag.className = (e.type === 'dragover' ? 'hover' : 'modal-body file-upload');
    }
  
    function fileSelectHandler(e) {
      // Fetch FileList object
      var files = e.target.files || e.dataTransfer.files;
  
      // Cancel event and hover styling
      fileDragHover(e);
  
      // Process all File objects
      for (var i = 0, f; f = files[i]; i++) {
        uploadFile(f);
      }
    }
  
    // Output
    function output(msg) {
      // Response
      var m = document.getElementById('messages');
      m.innerHTML = msg;
    }

    function outputName(msg) {
      // Response
      var m = document.getElementById('name');
      m.innerHTML = msg;
    }
  
    function parseFile(file) {
  
      outputName(
        '<strong>' + encodeURI(file.name) + '</strong>'
      );
      
      
      var imageName = file.name;
  
      var isGood = (/\.(?=mp4|mov|mkv)/gi).test(imageName);
      if (isGood) {
        document.getElementById('start').classList.add("hidden");
        document.getElementById('response').classList.remove("hidden");
        document.getElementById('notimage').classList.add("hidden");
        // Thumbnail Preview
        document.getElementById('file-image').classList.remove("hidden");
        document.getElementById('file-image').src = URL.createObjectURL(file);
      }
      else {
        document.getElementById('file-image').classList.add("hidden");
        document.getElementById('notimage').classList.remove("hidden");
        document.getElementById('start').classList.remove("hidden");
        document.getElementById('response').classList.add("hidden");
        document.getElementById("file-upload-form").reset();
      }
    }
  
    
  
    async function uploadFile(file) {
        document.getElementById("spinner").classList.remove("hidden");
        document.getElementById('start').classList.add("hidden");
        const formData = new FormData()
        formData.append("file",file)
        const response = await fetch("/upload", {
          method: "POST",
          body: formData,
        })
        const json = await response.json()
        document.getElementById("spinner").classList.add("hidden");
        document.getElementById('start').classList.remove("hidden");
        document.getElementById('watchButton').classList.remove("hidden");
        parseFile(file)
        output(json.message)

    }
  
    // Check for the various File API support.
    if (window.File && window.FileList && window.FileReader) {
      Init();
    } else {
      document.getElementById('file-drag').style.display = 'none';
    }
  }
  ekUpload();