// This file holds the main code for the plugins. It has access to the *document*.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (see documentation).

// This shows the HTML page in "ui.html".
figma.showUI(__html__, { themeColors: true, height: 320 });

// Some helper stuff
let reply: string;
const removeNewLinesAndOtherHtmlTags = (text: string) => {
  return text.replace(/(\r\n|\n|\r)/gm, " ");
};

// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.
figma.ui.onmessage = (msg) => {
  // One way of distinguishing between different types of messages sent from
  // your HTML page is to use an object with a "type" property like this.

  if (msg.type === "prompt") {
    const promptMsg = removeNewLinesAndOtherHtmlTags(msg.message);
    console.log(promptMsg);

    const url = "https://api.openai.com/v1/completions";
    // Use your own OpenAI API TOKEN
    const apiKey = "";

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "text-davinci-003",
        prompt: promptMsg,
        temperature: 1,
        max_tokens: 50,
      }),
    };

    fetch(url, options)
      .then((response) => response.json())
      .then((data) => {
        reply = removeNewLinesAndOtherHtmlTags(data.choices[0].text);
        console.log(reply);
        figma.ui.postMessage(reply);
      })
      .catch((error) => console.error(error));
  }

  if (msg.type === "apply") {
    // console.log(selection.type);
    let selection = figma.currentPage.selection[0];
    const myFontLoadingFunction = async () => {
      if (selection.type === "TEXT") {
        await figma.loadFontAsync(selection.fontName as FontName);
        // console.log(typeof selection.characters);
        // selection.characters = "";
        selection.characters = reply || "empty";
      }
    };
    myFontLoadingFunction();
  }

  // Make sure to close the plugin when you're done. Otherwise the plugin will
  // keep running, which shows the cancel button at the bottom of the screen.
  // figma.closePlugin();
};
