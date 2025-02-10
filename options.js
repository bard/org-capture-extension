///////////////////////////////////////////////////////////////////////////////////
// Copyright (c) 2015-2017 Konstantin Kliakhandler
//
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

function saveOptions() {
  const selectedTemplate = document.getElementById("selTemplate").value;
  const unselectedTemplate = document.getElementById("unselTemplate").value;
  const selectedTemplateSecondary = document.getElementById(
    "selTemplateSecondary",
  ).value;
  const unselectedTemplateSecondary = document.getElementById(
    "unselTemplateSecondary",
  ).value;
  const isDebug = document.getElementById("debug").checked;
  const showOverlay = document.getElementById("overlay").checked;

  chrome.storage.sync.set(
    {
      selectedTemplate,
      unselectedTemplate,
      selectedTemplateSecondary,
      unselectedTemplateSecondary,
      debug: isDebug,
      overlay: showOverlay,
    },
    function () {
      // Update status to let user know options were saved.
      const status = document.getElementById("status");
      status.textContent = "Options saved.";
      setTimeout(function () {
        status.textContent = "";
      }, 750);
    },
  );
}

function restoreOptions() {
  chrome.storage.sync.get(
    {
      selectedTemplate:
        "org-protocol://roam-ref?ref={url}&title={title}&body={selection}",
      unselectedTemplate: "org-protocol://roam-ref?ref={url}&title={title}",
      selectedTemplateSecondary:
        "org-protocol://store-link?url={url}&title={title}",
      unselectedTemplateSecondary:
        "org-protocol://store-link?url={url}&title={title}",
      debug: false,
      overlay: true,
    },
    function (options) {
      document.getElementById("unselTemplate").value =
        options.unselectedTemplate;
      document.getElementById("selTemplate").value = options.selectedTemplate;
      document.getElementById("selTemplateSecondary").value =
        options.selectedTemplateSecondary;
      document.getElementById("unselTemplateSecondary").value =
        options.unselectedTemplateSecondary;
      document.getElementById("debug").checked = options.debug;
      document.getElementById("overlay").checked = options.overlay;
    },
  );
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.getElementById("save").addEventListener("click", saveOptions);
