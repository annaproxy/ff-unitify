/*
TODO:
[ ] An/a replacement
[ ] Why does google fuck everything
[ ] On/off with a click
[ ] Icon
*/
// Thanks to https://github.com/mdn/webextensions-examples
var PUNCTS = "[.,\/#!$%\^&\'\"*;:{}=\-_`~()]";

function replaceText(node, uppercase) {
    // Setting textContent on a node removes all of its children and replaces
    // them with a single text node. Since we don't want to alter the DOM aside
    // from substituting text, we only substitute on single text nodes.
    // @see https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent

    if (node.nodeType === Node.TEXT_NODE) {

        // This node only contains text.
        // @see https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType.

        // Skip textarea nodes 
        if (node.parentNode &&
            node.parentNode.nodeName === 'TEXTAREA') {
            return;
        }

        // Because DOM manipulation is slow, we don't want to keep setting
        // textContent after every replacement. Instead, manipulate a copy of
        // this string outside of the DOM and then perform the manipulation
        // once, at the end.
        let content = node.textContent;
        
        browser.runtime.sendMessage({
            type: "getTagged",
            value: content
        }).then(function(message) {

            tagged = message.result;
            tagged_lower = message.lowercased;
            //console.log(tagged);
            content = ""
            for (var i = 0; i < tagged.length; i++) {
                tt = tagged[i];
                tt_lower = tagged_lower[i];
                var hi = tt['value'];
                if (!PUNCTS.includes(hi[0])) {
                    content += " ";
                }

                if (tt['pos'] == 'NN') {
                    content += "unit"
                } 
                
                else if (tt['pos'] == 'NNS') {
                    content += "units"
                }
                
                else if (uppercase & tt_lower['pos'] == 'NN'){
                    content += "Unit";
                }

                else if (uppercase & tt_lower['pos'] == 'NNS'){
                    content += "Units";
                }

                else {
                    content += tt['value']
                }
            }

            // Now that all the replacements are done, perform the DOM manipulation.
            node.textContent = content;
        });
    } else {
        // This node contains more than just text, call replaceText() on each
        // of its children.
        for (let i = 0; i < node.childNodes.length; i++) {
            replaceText(node.childNodes[i], uppercase);
        }
    }
}

function replaceWrapper(pns){
    // Start the recursion from the body tag.
    replaceText(document.body, pns);

    // Now monitor the DOM for additions and substitute emoji into new nodes.
    // @see https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver.
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                // This DOM change was new nodes being added. Run our substitution
                // algorithm on each newly added node.
                for (let i = 0; i < mutation.addedNodes.length; i++) {
                    const newNode = mutation.addedNodes[i];
                    replaceText(newNode);
                }
            }
        });
    });
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

browser.runtime.onMessage.addListener((message) => {

    // Unitify
    if (message.command === "unitify") {
      replaceWrapper(false);
    } 

    // Replace capital NN as well 
    else if (message.command === "unitifyplus") {
        replaceWrapper(true);
    } 
    
  });



