$(function() {
    resizeTabs()
    $("div.tabs ul li").click(function () {
        let tabId = this.id
        let contentId = this.id + '-content'

        $("div.tabs ul li").removeClass("selected")
        $("div.tabs ul li#" + tabId).addClass("selected")

        $("div.tabs div.tab-content").removeClass("selected")
        $("div.tabs div#" + contentId).addClass("selected")
    })

    $(window).resize(resizeTabs)
})

function resizeTabs () {
    let arr = $("div.tabs div.tab-content").toArray().map(x =>
        $(x).height()
    )
    let max = Math.max(...arr)
    $("div.tabs div.tab-content").each(function () { 
        $(this).height(max)
    })
}