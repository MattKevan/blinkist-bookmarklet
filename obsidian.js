javascript:(function(){
  const folder = "Summaries/";
  const category = "[[Summaries]]"
  const vault = ""; 
  const baseTags = "summary, blinkist"; 

  function getBookId() {
    var match = document.body.innerHTML.match(/"id":"([0-9a-f]{24})"/);
    if(match) return match[1];
    var el = document.querySelector('[data-book-id]');
    if(el) return el.getAttribute('data-book-id');
    var regex = /[0-9a-f]{24}/g;
    var potential = document.body.innerHTML.match(regex);
    if(potential && potential.length > 0) return potential[0];
    return null;
  }

  function htmlToMarkdown(html) {
    if (!html) return "";
    var text = html;
    text = text.replace(/<strong>(.*?)<\/strong>/gi, '**$1**');
    text = text.replace(/<b>(.*?)<\/b>/gi, '**$1**');
    text = text.replace(/<em>(.*?)<\/em>/gi, '*$1*');
    text = text.replace(/<i>(.*?)<\/i>/gi, '*$1*');
    text = text.replace(/<ul>/gi, '');
    text = text.replace(/<\/ul>/gi, '');
    text = text.replace(/<li>/gi, '\n- ');
    text = text.replace(/<\/li>/gi, '');
    text = text.replace(/<br\s*\/?>/gi, '\n');
    text = text.replace(/<p>/gi, '');
    text = text.replace(/<\/p>/gi, '\n\n');
    text = text.replace(/<h[1-6]>(.*?)<\/h[1-6]>/gi, '\n## $1\n');
    text = text.replace(/<[^>]+>/g, '');
    var ta = document.createElement('textarea');
    ta.innerHTML = text;
    return ta.value.trim();
  }

  function getMeta(name) {
    const meta = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
    return meta ? meta.getAttribute('content') : '';
  }

  function getFileName(fileName) {
    var platform = window.navigator.platform;
    var windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'];
    if (windowsPlatforms.indexOf(platform) !== -1) {
      fileName = fileName.replace(':', '').replace(/[/\\?%*|"<>]/g, '-');
    } else {
      fileName = fileName.replace(':', '').replace(/\//g, '-').replace(/\\/g, '-');
    }
    return fileName;
  }

  async function run() {
    var id = getBookId();
    if(!id) { alert("Could not find Book ID on this page."); return; }
    
    var lang = window.location.pathname.split('/')[1] || 'en';
    var apiUrl = 'https://api.blinkist.com/transcripts/' + id + '?language=' + lang;

    try {
      var response = await fetch(apiUrl);
      if(!response.ok) throw new Error("API Request failed: " + response.status);
      var data = await response.json();

      var rawTitle = document.title.replace(' | Blinkist', '').replace(' - Blinkist', '').trim();
      var finalTitle = rawTitle;
      var finalAuthor = getMeta('author') || "Unknown";
      var splitIndex = rawTitle.lastIndexOf(" by ");
      
      if (splitIndex !== -1) {
        finalTitle = rawTitle.substring(0, splitIndex).trim();
        finalAuthor = rawTitle.substring(splitIndex + 4).trim();
      }

      var url = window.location.href;
      var dateObj = new Date();
      var yyyy = dateObj.getFullYear();
      var mm = String(dateObj.getMonth() + 1).padStart(2, '0');
      var dd = String(dateObj.getDate()).padStart(2, '0');
      var today = `${yyyy}-${mm}-${dd}`;

      var mdBody = "";
      if (data.transcript && data.transcript.transcriptSections) {
        data.transcript.transcriptSections.forEach(function(section) {
          if (section.transcriptComponents) {
            section.transcriptComponents.forEach(function(component) {
              if (component.value && component.value.html) {
                var clean = htmlToMarkdown(component.value.html);
                if(component.componentType === 'header') mdBody += '## ' + clean + '\n\n';
                else mdBody += clean + '\n\n';
              }
            });
          }
        });
      } else {
        mdBody = "No transcript data found.";
      }

      mdBody = mdBody.replace(/\n{3,}/g, "\n\n");

      var fileName = getFileName(finalTitle);
      var vaultParam = vault ? `&vault=${encodeURIComponent(vault)}` : '';
      var authorLink = finalAuthor !== "Unknown" ? `[[${finalAuthor}]]` : "Unknown";

      var fileContent = 
        '---\n' +
        'category: "' + category + '"\n' +
        'author: "' + authorLink + '"\n' +
        'title: "' + finalTitle + '"\n' +
        'source: ' + url + '\n' +
        'clipped: ' + today + '\n' +
        'tags: [' + baseTags + ']\n' +
        '---\n\n' +
        '# ' + finalTitle + '\n\n' +
        mdBody;

      var obsUrl = "obsidian://new?" +
                   "file=" + encodeURIComponent(folder + fileName) +
                   "&content=" + encodeURIComponent(fileContent) +
                   vaultParam;

      document.location.href = obsUrl;

    } catch (e) {
      alert("Error: " + e.message);
    }
  }
  run();
})();
