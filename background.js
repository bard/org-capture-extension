///////////////////////////////////////////////////////////////////////////////////
// Copyright (c) 2015-2017 Konstantin Kliakhandler
// //
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
///////////////////////////////////////////////////////////////////////////////////

chrome.runtime.onInstalled.addListener(function (details) {
  if (details.reason == "install") {
    chrome.storage.sync.set({
      selectedTemplate:
        "org-protocol://roam-ref?template=q&ref={url}&title={title}&body={selection}",
      unselectedTemplate:
        "org-protocol://roam-ref?template=r&ref={url}&title={title}",
      selectedTemplateSecondary:
        "org-protocol://store-link?url={url}&title={title}",
      unselectedTemplateSecondary:
        "org-protocol://store-link?url={url}&title={title}",
      debug: false,
      overlay: true,
    });
  } else if (
    details.reason == "update" &&
    details.previousVersion.startsWith("0.1")
  ) {
    chrome.storage.sync.set({
      selectedTemplate:
        "org-protocol://roam-ref?template=q&ref={url}&title={title}&body={selection}",
      unselectedTemplate:
        "org-protocol://roam-ref?template=r&ref={url}&title={title}",
      selectedTemplateSecondary:
        "org-protocol://store-link?url={url}&title={title}",
      unselectedTemplateSecondary:
        "org-protocol://store-link?url={url}&title={title}",
      debug: false,
      overlay: true,
    });
  }
});

chrome.action.onClicked.addListener(function (tab) {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: capture,
    args: [{ template: "primary" }],
  });
});

chrome.commands.onCommand.addListener(function (command) {
  if (command === "secondary") {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: capture,
        args: [{ template: "secondary" }],
      });
    });
  }
});

async function capture(args) {
  function replaceAll(str, find, replace) {
    return str.replace(new RegExp(find, "g"), replace);
  }

  // https://github.com/sprig/org-capture-extension/issues/37
  function escapeIt(text) {
    return replaceAll(
      replaceAll(
        replaceAll(encodeURIComponent(text), "[(]", escape("(")),
        "[)]",
        escape(")"),
      ),
      "[']",
      escape("'"),
    );
  }

  function log(message) {
    if (!this.debug) return;
    console.log(message);
  }

  function toggleOverlay() {
    const outerId = "org-capture-extension-overlay";
    const innerId = "org-capture-extension-text";
    if (!document.getElementById(outerId)) {
      const outerDiv = document.createElement("div");
      outerDiv.id = outerId;

      const innerDiv = document.createElement("div");
      innerDiv.id = innerId;
      innerDiv.innerHTML = "Captured";

      outerDiv.appendChild(innerDiv);
      document.body.appendChild(outerDiv);

      const css = document.createElement("style");
      css.type = "text/css";
      // noinspection JSAnnotator
      css.innerHTML = `#org-capture-extension-overlay {
        position: fixed; /* Sit on top of the page content */
        display: none; /* Hidden by default */
        width: 100%; /* Full width (cover the whole page) */
        height: 100%; /* Full height (cover the whole page) */
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0,0,0,0.2); /* Black background with opacity */
        z-index: 1; /* Specify a stack order in case you're using a different order for other elements */
        cursor: pointer; /* Add a pointer on hover */
    }

    #org-capture-extension-text{
    position: absolute;
    top: 50%;
    left: 50%;
    font-size: 50px;
    color: white;
    transform: translate(-50%,-50%);
    -ms-transform: translate(-50%,-50%);
}`;
      document.body.appendChild(css);
    }

    function on() {
      document.getElementById(outerId).style.display = "block";
    }

    function off() {
      document.getElementById(outerId).style.display = "none";
    }

    on();
    setTimeout(off, 200);
  }

  //////////////////////////////////////////////////////////////////////

  if (chrome.runtime.lastError) {
    alert(
      "Could not capture url. Error loading options: " +
        chrome.runtime.lastError.message,
    );
    return;
  }

  const options = await chrome.storage.sync.get(null);

  // Capture global objects
  const win = window;
  const doc = document;
  const loc = location;

  // Capture page data
  const selectionText = escapeIt(win.getSelection().toString());
  const encodedUrl = encodeURIComponent(loc.href);
  const escapedTitle = escapeIt(doc.title);

  let template;
  if (args?.template === "secondary") {
    template =
      selectionText.trim() !== ""
        ? options.selectedTemplateSecondary
        : options.unselectedTemplateSecondary;
  } else {
    template =
      selectionText.trim() !== ""
        ? options.selectedTemplate
        : options.unselectedTemplate;
  }

  const uri = template
    .replace(/{url}/g, encodedUrl)
    .replace(/{title}/g, escapedTitle)
    .replace(/{selection}/g, selectionText);

  log("Capturing the following URI with new org-protocol: ", uri);

  location.href = uri;

  if (options.overlay) {
    toggleOverlay();
  }
}
