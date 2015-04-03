var $ = require('jquery');
// var doT = require('dot');

// doT.templateSettings = {
//   evaluate:    /<%([\s\S]+?)%>/g,
//   interpolate: /<%=([\s\S]+?)%>/g,
//   encode:      /<%!([\s\S]+?)%>/g,
//   use:         /<%#([\s\S]+?)%>/g,
//   define:      /\{\{##\s*([\w\.$]+)\s*(\:|=)([\s\S]+?)#\}\}/g,
//   conditional: /\{\{\?(\?)?\s*([\s\S]*?)\s*\}\}/g,
//   iterate:     /\{\{~\s*(?:\}\}|([\s\S]+?)\s*\:\s*([\w$]+)\s*(?:\:\s*([\w$]+))?\s*\}\})/g,
//   varname: 'it',
// };

var $window = $(window),
    $dialog = $('#dialog'),
    $dialogContent = $('#dialog .content'),
    $prev,
    $next,
    dialogOpen = false,
    $media,
    $caption,
    isVideo = false,
    isPlaying = false;

function setDim() {

    var width = $dialogContent.width();
    var height = $dialogContent.height();

    if (width < 450) return;
    if (height < 450) return;

    if (width > 500) {
        var newWidth = width * 0.70;
        if (newWidth > height) {
            $media.css('width', height);
            $media.css('height', height);
        } else {
            $media.css('width', newWidth);
            $media.css('height', newWidth);
        }

        $caption.css('width', width * 0.29);
    } else {
        $media.css('width', width - 200);
        $media.css('height', width - 200);
        $caption.css('width', 200);
    }
}

function makeDetails($el) {
    var $detail = $el.children('.detail');
    $prev = $el.prev('.grid-item');
    $next = $el.next('.grid-item');

    if ($detail.length) {
        var $fill = $($detail.html());

        $media = $fill.find('img,video').eq(0);
        $caption = $fill.find('figcaption').eq(0);

        isVideo = $media.is('video');
        isPlaying = false;

        if (isVideo) {
            $media[0].addEventListener('play', function () {
                isPlaying = true;
            });
        }

        var $figcaption = $fill.find('figcaption');

        if ($prev.length) {
            $figcaption.append('<span class="prev-item">&#9664;</span>');
        }
        if ($next.length) {
            $figcaption.append('<span class="next-item">&#9654;</span>');
        }

        $dialogContent.html($fill);
        $dialog.show();
        setDim();

        if (!dialogOpen) {
            $window.on('resize.dialog', setDim);
            $dialog.on('click.close', closeDialog);
            $('body').addClass('dialog-open');
            dialogOpen = true;
        }
    }
}

function closeDialog() {
    if (isVideo) {
        $media[0].pause();
    }

    $dialog.off('click.close');
    $window.off('resize.dialog');
    $('body').removeClass('dialog-open');
    $dialog.hide();
    dialogOpen = false;
}

function handleGridMedia(e) {
    if (isVideo && isPlaying) {
        isPlaying = false;
        $media[0].pause();
    } else if (isVideo) {
        $media[0].play();
    }

    return false;
}

function handleGridNext(e) {
    makeDetails($next);
    return false;
}

function handleGridPrev(e) {
    makeDetails($prev);
    return false;
}

function handleGridItem(e) {
    makeDetails($(this));
}

$dialog.on('click.media', 'video,img', handleGridMedia);
$dialog.on('click.prev', '.next-item', handleGridNext);
$dialog.on('click.next', '.prev-item', handleGridPrev);
$('.grid').on('click', '.grid-item', handleGridItem);
