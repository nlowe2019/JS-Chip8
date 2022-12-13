import { debug, updateLogDOM } from "./debug.js"

$(function() {
    resizeTabs()
    $("div.tabs ul li").click(function () {
        if(!(!debug && $(this).hasClass("debug"))) {
            let tabId = this.id
            let contentId = this.id + '-content'

            $("div.tabs ul li").removeClass("selected")
            $("div.tabs ul li#" + tabId).addClass("selected")

            $("div.tabs div.tab-content").removeClass("selected")
            $("div.tabs div#" + contentId).addClass("selected")
        }
        updateLogDOM()
    })

    $(window).resize(resizeTabs)
})

function resizeTabs () {
    let arr = $("div.tab-content").toArray().map(x =>
        $(x).height()
    )
    let max = Math.max(...arr)
    $(".tab-content").each(function () { 
        $(this).height(max)
    })
    let t1h = $("#tab1-content").height()
    $('#tab3-content').height(t1h)
}