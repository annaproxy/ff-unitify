/**
* Listen for clicks on the buttons, and send the appropriate message to
* the content script in the page.
* General code structure inspired by https://github.com/mdn/webextensions-examples/tree/master/beastify
* Since I don't know javascript
*/
function listenForClicks() {
document.addEventListener("click", (e) => {

    function unitify(tabs) {
        browser.tabs.sendMessage(tabs[0].id, {
        command: "unitify",
        });
    }

    function unitifyplus(tabs) {
        browser.tabs.sendMessage(tabs[0].id, {
        command: "unitifyplus",
        });
    }

    function reportError(error) {
        console.error(`Could not unitify: ${error}`);
    }

    // Call unitify/refresh/capital unitify on active tab
    if (e.target.classList.contains("on")) {
            browser.tabs.query({active: true, currentWindow: true})
            .then(unitify)
            .catch(reportError);
        }
    else if (e.target.classList.contains("off")){
        browser.tabs.reload();
    }
    else if (e.target.classList.contains("capital")) {
            browser.tabs.query({active: true, currentWindow: true})
            .then(unitifyplus)
            .catch(reportError);
        }

    });
}

function reportExecuteScriptError(error) {
    document.querySelector("#popup-content").classList.add("hidden");
    document.querySelector("#error-content").classList.remove("hidden");
    console.error(`Failed to execute content script: ${error.message}`);
}

browser.tabs.executeScript({file: "unit.js"})
.then(listenForClicks)
.catch(reportExecuteScriptError);