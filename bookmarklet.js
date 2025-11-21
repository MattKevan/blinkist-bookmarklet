javascript:(function(){
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
  async function run() {
    var id = getBookId();
    if(!id) { alert("Could not find Book ID on this page."); return; }
    var lang = window.location.pathname.split('/')[1] || 'en';
    var apiUrl = 'https://api.blinkist.com/transcripts/' + id + '?language=' + lang;
    try {
      var response = await fetch(apiUrl);
      if(!response.ok) throw new Error("API Request failed: " + response.status);
      var data = await response.json();
      var md = '# ' + document.title.replace(' - Blinkist', '') + '\n\n';
      if (data.transcript && data.transcript.transcriptSections) {
        data.transcript.transcriptSections.forEach(function(section) {
          if (section.transcriptComponents) {
            section.transcriptComponents.forEach(function(component) {
              if (component.value && component.value.html) {
                var clean = htmlToMarkdown(component.value.html);
                if(component.componentType === 'header') md += '## ' + clean + '\n\n';
                else md += clean + '\n\n';
              }
            });
          }
        });
      } else {
        md = "No transcript data found.";
      }
      md = md.replace(/\n{3,}/g, "\n\n");
      
      var container = document.createElement('div');
      container.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);z-index:99999;display:flex;justify-content:center;align-items:center;";
      container.id = "blinkist-md-overlay";
      var box = document.createElement('div');
      box.style.cssText = "background:#fff;width:800px;height:80%;padding:20px;border-radius:8px;display:flex;flex-direction:column;box-shadow:0 0 20px rgba(0,0,0,0.5);";
      var header = document.createElement('div');
      header.style.cssText = "display:flex;justify-content:space-between;margin-bottom:10px;";
      header.innerHTML = '<h2 style="margin:0">Markdown Content</h2><button onclick="document.getElementById(\'blinkist-md-overlay\').remove()">Close</button>';
      var textarea = document.createElement('textarea');
      textarea.value = md;
      textarea.style.cssText = "flex:1;width:100%;font-family:monospace;padding:10px;border:1px solid #ccc;";
      var footer = document.createElement('div');
      footer.style.cssText = "margin-top:10px;text-align:right;";
      var copyBtn = document.createElement('button');
      copyBtn.innerText = "Copy to Clipboard";
      copyBtn.style.cssText = "padding:10px 20px;background:#007acc;color:white;border:none;cursor:pointer;border-radius:4px;";
      copyBtn.onclick = function() {
        textarea.select();
        document.execCommand('copy');
        this.innerText = "Copied!";
        var _this = this;
        setTimeout(function(){ _this.innerText = "Copy to Clipboard"; }, 2000);
      };
      footer.appendChild(copyBtn);
      box.appendChild(header);
      box.appendChild(textarea);
      box.appendChild(footer);
      container.appendChild(box);
      document.body.appendChild(container);
    } catch (e) {
      alert("Error: " + e.message);
    }
  }
  run();
})();
