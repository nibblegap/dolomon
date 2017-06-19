// vim:set sw=4 ts=4 sts=4 ft=javascript expandtab:

/*
 * Display messages
 */
function addAlert(c, msg) {
    $('body > .container').prepend([
        '<div class="alert ', c, ' alert-dismissible fade in">',
            '<button type="button" class="close" data-dismiss="alert" aria-label="', i18n.close, '"><span aria-hidden="true">&times;</span></button>',
            msg,
        '</div>',
    ].join(''));
}

/*
 * Remove things
 */
$('.action-remove').on('click', aRemove);
function aRemove(event) {
    var button = $(this);
    var modal  = $('#rmModal');
    $('#rmConfirm').unbind('click');

    var rm = button.data('rm');
    switch(rm) {
        case 'dolo':
            modal.find('.modal-title').html(i18n.rmDolo);
            modal.find('.modal-body p').html(i18n.doloRmName.replace('XXXX', button.data('url')));
            break;
        case 'category':
            modal.find('.modal-title').html(i18n.rmCat);
            modal.find('.modal-body p').html(i18n.catRmName.replace('XXXX', button.data('name')));
            break;
        case 'tag':
            modal.find('.modal-title').html(i18n.rmTag);
            modal.find('.modal-body p').html(i18n.tagRmName.replace('XXXX', button.data('name')));
            break;
        case 'app':
            modal.find('.modal-title').html(i18n.rmApp);
            modal.find('.modal-body p').html(i18n.appRmName.replace('XXXX', button.data('name')));
            break;
    }
    $('#rmConfirm').on('click', function() {
        $.ajax({
            method: 'DELETE',
            url: button.data('action'),
            data: { id: button.data('id') },
            dataType: 'json',
            success: function(data, textStatus, jqXHR) {
                var c = 'alert-danger';
                if (data.success) {
                    c = 'alert-success';
                    switch(rm) {
                        case 'dolo':
                            if ($('#doloTagList').length === 0) {
                                button.parent().parent().parent().remove();
                            } else {
                                button.parent().remove();
                            }
                            break;
                        case 'app':
                            button.parent().parent().parent().remove();
                            break;
                        case 'category':
                        case 'tag':
                            button.parent().parent().parent().parent().remove();
                            break;
                    }
                }
                modal.modal('hide');
                addAlert(c, data.msg);
            }
        });
    });
    modal.modal('show');
}

/*
 * Modify things
 */
$('.action-modify').on('click', aModify);
function aModify(event) {
    var button = $(this);
    var modal  = $('#modModal');
    $('#modConfirm').unbind('click');
    $('#modModalInput').unbind('keydown');

    var mod = button.data('mod');
    var title;
    switch(mod) {
        case 'dolo':
        case 'app':
            title = $(button.parent().parent().parent().find('.name')['0']);
            break;
        case 'cat':
        case 'tag':
            title = $(button.parent().parent().find('a[data-toggle="collapse"]')['0']);
            break;
    }
    switch(mod) {
        case 'dolo':
            modal.find('.modal-title').html(i18n.modDolo);
            modal.find('.modal-body form').html(
                [
                    '<div class="form-group">',
                    '    <label for="url">', i18n.url,'</label>',
                    '    <input type="url" class="form-control" name="url" placeholder="https://example.org/logo.png" id="doloUrl" required="required" value="', button.data('url'), '">',
                    '</div>',
                    '<div class="form-group">',
                    '    <label for="name">', i18n.name,'</label>',
                    '    <input type="text" class="form-control" name="name" placeholder="', i18n.extraordinaryDolo,'" id="doloName" value="', button.data('name'), '">',
                    '</div>',
                    '<div class="form-group">',
                    '    <label for="extra">', i18n.extra,'</label>',
                    '    <input type="text" class="form-control" name="extra" placeholder="', i18n.whatever,'" id="doloExtra" value="', button.data('extra'), '">',
                    '</div>',
                    '<div class="form-group">',
                    '    <label for="cat">', i18n.category,'</label>',
                    '    <select class="form-control" name="cat" id="catList" required="required">',
                    '    </select>',
                    '</div>',
                    '<div class="form-group">',
                    '    <label for="tag">', i18n.tags,'</label>',
                    '    <select multiple class="form-control" name="tag" id="tagList">',
                    '    </select>',
                    '</div>',
                ].join('')
            );
            $.ajax({
                method: 'GET',
                url: url.get_cats,
                dataType: 'json',
                success: function(data, textStatus, jqXHR) {
                    if (data.success) {
                        data.object.forEach(function(element, index, array) {
                            if (element.id === button.data('cat')) {
                                $('#catList').append(['<option value="', element.id, '" selected="selected">', element.name,'</option>'].join(''));
                            } else {
                                $('#catList').append(['<option value="', element.id, '">', element.name,'</option>'].join(''));
                            }
                        });
                    }
                }
            });
            $.ajax({
                method: 'GET',
                url: url.get_tags,
                dataType: 'json',
                success: function(data, textStatus, jqXHR) {
                    if (data.success) {
                        if (data.object.length === 0) {
                            $('#tagList').parent().addClass('hidden');
                        } else {
                            var t = button.data('tags').toString().split(',');
                            data.object.forEach(function(element, index, array) {
                                if (t.indexOf(element.id.toString()) !== -1) {
                                    $('#tagList').append(['<option value="', element.id, '" selected="selected">', element.name,'</option>'].join(''));
                                } else {
                                    $('#tagList').append(['<option value="', element.id, '">', element.name,'</option>'].join(''));
                                }
                            });
                        }
                    }
                }
            });
            break;
        case 'category':
            modal.find('.modal-title').html(i18n.modCat);
            modal.find('.modal-body label').html(i18n.catName);
            $('#modModalInput').attr('placeholder', i18n.awesomeCat);
            $('#modModalInput').focus();
            break;
        case 'tag':
            modal.find('.modal-title').html(i18n.modTag);
            modal.find('.modal-body label').html(i18n.tagName);
            $('#modModalInput').attr('placeholder', i18n.wonderTag);
            $('#modModalInput').focus();
            break;
        case 'app':
            modal.find('.modal-title').html(i18n.modApp);
            modal.find('.modal-body label').html(i18n.appName);
            $('#modModalInput').attr('placeholder', i18n.astonishingApp);
            $('#modModalInput').focus();
            break;
    }
    switch(mod) {
        case 'dolo':
            $('#modConfirm').click(function() {
                $.ajax({
                    method: 'PUT',
                    url: button.data('action'),
                    data: {
                        id: button.data('id'),
                        url: $('#doloUrl').val(),
                        name: $('#doloName').val(),
                        extra: $('#doloExtra').val(),
                        cat_id: $('#catList').val(),
                        tags: $('#tagList').val()
                    },
                    dataType: 'json',
                    success: function(data, textStatus, jqXHR) {
                        var c = 'alert-danger';
                        if (data.success) {
                            c = 'alert-success';
                        }
                        modal.modal('hide');
                        addAlert(c, data.msg);
                        title.text(data.object.name);
                        $(button.parent().parent().parent().find('.url')['0']).text(data.object.url);
                        button.data('url', data.object.url);
                        button.data('name', data.object.name);
                        button.data('extra', data.object.extra);
                        button.data('cat', data.object.category_id);
                        var tags = new Array();
                        data.object.tags.forEach(function(element, index, array) {
                            tags.push(element.id);
                        });
                        button.data('tags', tags.join(','));
                        button.parent().find('.action-remove').data('url', data.object.url);
                        button.parent().find('.action-remove').data('name', data.object.name);
                        button.parent().find('.action-remove').data('extra', data.object.extra);
                        if ($('#doloTagList').length !== 0) {
                            var html = new Array();
                            data.object.tags.forEach(function(element, index, array) {
                                html.push(['<li><a href="', url.show_tags.replace(/\/[^\/]+$/, '/'), element.id, '">', element.name, '</a></li>'].join(''));
                            });
                            $('#doloTagList').html(html);
                        }
                    }
                });
            });
            break;
        default:
            $('#modModalInput').val(button.data('name'));
            $('#modModalInput').on('keydown', function(e) {
                if(e.which == 13) {
                    e.preventDefault();
                    $('#modConfirm').click();
                }
            });
            $('#modConfirm').click(function() {
                $.ajax({
                    method: 'PUT',
                    url: button.data('action'),
                    data: { id: button.data('id'), name: $('#modModalInput').val() },
                    dataType: 'json',
                    success: function(data, textStatus, jqXHR) {
                        var c = 'alert-danger';
                        if (data.success) {
                            c = 'alert-success';
                        }
                        modal.modal('hide');
                        addAlert(c, data.msg);
                        title.text(data.newname);
                        button.data('name', data.newname);
                    }
                });
            });
    }
    modal.modal('show');
}

/*
 * Filter things (dolos or apps)
 */
$('.filter').val('');
$('.filter').on('keyup', filter);
function filter(event) {
    var thi = this;
    var input = $(thi);
    input.parent().parent().find('.filter').each(function (index, element) {
        if (element != thi) {
            $(element).val('');
        }
    });
    var val = input.val();
    var sel = input.data('filter');
    input.parent().parent().parent().parent().find(sel).each(function (index, element) {
        var e = $(element);
        if (val === undefined || val === '') {
            e.parent().removeClass('hidden');
        } else {
            if (!e.text().match(new RegExp(val))) {
                e.parent().addClass('hidden');
            } else {
                e.parent().removeClass('hidden');
            }
        }
    });
}

/*
 * Create things
 */
$('#addModal').on('show.bs.modal', function(event) {
    $('#confirm').unbind('click');
    $('#modalInput').unbind('keydown');
    $('#modalInput').removeClass('failed');

    var button = $(event.relatedTarget);

    var add = button.data('add');
    var modal = $(this);
    modal.find('.modal-body form').html(
        [
            '<div class="form-group" id="modalForm">',
            '    <label for="name" id="modalLabel"></label>',
            '    <input type="text" class="form-control" id="modalInput" name="name" required="required">',
            '</div>',
        ].join('')
    );
    switch(add) {
        case 'dolo':
            modal.find('.modal-title').html(i18n.addDolo);
            modal.find('.modal-body form').html(
                [
                    '<div class="form-group">',
                    '    <label for="url">', i18n.url,'</label>',
                    '    <input type="url" class="form-control" name="url" placeholder="https://example.org/logo.png" id="doloUrl" required="required">',
                    '</div>',
                    '<div class="form-group">',
                    '    <label for="short"">', i18n.doloUrl, '</label>',
                    '    <input type="text" class="form-control" name="short" placeholder="', i18n.exampleLogo,'" id="doloShort">',
                    '</div>',
                    '<div class="form-group">',
                    '    <label for="name">', i18n.name,'</label>',
                    '    <input type="text" class="form-control" name="name" placeholder="', i18n.extraordinaryDolo,'" id="doloName">',
                    '</div>',
                    '<div class="form-group">',
                    '    <label for="extra">', i18n.extra,'</label>',
                    '    <input type="text" class="form-control" name="extra" placeholder="', i18n.whatever,'" id="doloExtra">',
                    '</div>',
                    '<div class="form-group">',
                    '    <label for="count">', i18n.initialCounter,'</label>',
                    '    <input type="number" class="form-control" name="count" min="0" value="0" step="1" id="initialCount">',
                    '</div>',
                    '<div class="form-group">',
                    '    <label for="cat">', i18n.category,'</label>',
                    '    <select class="form-control" name="cat" id="catList" required="required">',
                    '    </select>',
                    '</div>',
                    '<div class="form-group">',
                    '    <label for="tag">', i18n.tags,'</label>',
                    '    <select multiple class="form-control" name="tag" id="tagList">',
                    '    </select>',
                    '</div>',
                ].join('')
            );
            $.ajax({
                method: 'GET',
                url: url.get_cats,
                dataType: 'json',
                success: function(data, textStatus, jqXHR) {
                    if (data.success) {
                        data.object.forEach(function(element, index, array) {
                            $('#catList').append(['<option value="', element.id, '">', element.name,'</option>'].join(''));
                        });
                    }
                }
            });
            $.ajax({
                method: 'GET',
                url: url.get_tags,
                dataType: 'json',
                success: function(data, textStatus, jqXHR) {
                    if (data.success) {
                        if (data.object.length === 0) {
                            $('#tagList').parent().addClass('hidden');
                        } else {
                            data.object.forEach(function(element, index, array) {
                                $('#tagList').append(['<option value="', element.id, '">', element.name,'</option>'].join(''));
                            });
                        }
                    }
                }
            });
            break;
        case 'category':
            modal.find('.modal-title').html(i18n.addCat);
            modal.find('.modal-body label').html(i18n.catName);
            $('#modalInput').attr('placeholder', i18n.awesomeCat);
            $('#modalInput').focus();
            break;
        case 'tag':
            modal.find('.modal-title').html(i18n.addTag);
            modal.find('.modal-body label').html(i18n.tagName);
            $('#modalInput').attr('placeholder', i18n.wonderTag);
            $('#modalInput').focus();
            break;
        case 'app':
            modal.find('.modal-title').html(i18n.addApp);
            modal.find('.modal-body label').html(i18n.appName);
            $('#modalInput').attr('placeholder', i18n.astonishingApp);
            $('#modalInput').focus();
            break;
    }
    switch(add) {
        case 'dolo':
            $('#confirm').click(function() {
                $('.failed').each(function( index ) {
                    $(this).removeClass('failed');
                });
                $('.error-msg').each(function( index ) {
                    $(this).remove();
                });
                $.ajax({
                    method: 'POST',
                    url: button.data('action'),
                    data: {
                        url: $('#doloUrl').val(),
                        short: $('#doloShort').val(),
                        name: $('#doloName').val(),
                        extra: $('#doloExtra').val(),
                        initial_count: $('#initialCount').val(),
                        cat_id: $('#catList').val(),
                        tags: $('#tagList').val()
                    },
                    dataType: 'json',
                    success: function(data, textStatus, jqXHR) {
                        if (data.success) {
                            var tags = [];
                            data.object.tags.forEach(function(element, index, array) {
                                tags.push(element.id);
                            });
                            addAlert('alert-success', data.msg);
                            if (window.location.pathname.indexOf('dashboard') !== -1) {
                                $('#dolo_nb').text(parseInt($('#dolo_nb').text()) + 1);
                            } else {
                                if ($('#doloTbody').length !== 0) {
                                    $('#doloTbody').append(
                                        [
                                            '<tr id="dolo_id_', data.object.id, '">',
                                            '    <td class="url">', data.object.url, '</td>',
                                            '    <td class="durl">', url.base_url, data.object.short, '</td>',
                                            '    <td class="name">', data.object.name, '</td>',
                                            '    <td class="extra">', data.object.extra, '</td>',
                                            '    <td class="hits">', data.object.count, '</td>',
                                            '    <td>',
                                            '        <div class="pull-right">',
                                            '            <a href="', url.show_dolo, data.object.id, '"><span class="glyphicon glyphicon-eye-open" aria-hidden="true" aria-label="', i18n.showDolo, '"></span></a>',
                                            '            <a class="action-modify" href="#" data-id="', data.object.id, '" data-action="', window.mod_url, '" data-mod="dolo" data-name="', data.object.name, '" data-extra="', data.object.extra, '" data-url="', data.object.url, '" data-short="', data.object.short, '" data-cat="', data.object.category_id, '" data-tags="', tags.join(','), '"><span class="glyphicon glyphicon-pencil" aria-hidden="true" aria-label="', i18n.modDolo, '"></span></a>',
                                            '            <a class="action-remove" href="#" data-id="', data.object.id, '" data-action="', window.del_url, '" data-rm="dolo" data-name="', data.object.name, '" data-extra="', data.object.extra, '" data-url="', data.object.url, '"><span class="glyphicon glyphicon-remove" aria-hidden="true" aria-label="', i18n.rmDolo, '"></span></a>',
                                            '        </div>',
                                            '    </td>',
                                            '</tr>',
                                        ].join('')
                                    );
                                } else if ($('#catAccordion').length !== 0) {
                                    $('#cat_id_'+data.object.category_id).append(
                                        [
                                            '<tr id="dolo_id_', data.object.id, '">',
                                            '    <td class="url">', data.object.url, '</td>',
                                            '    <td class="durl">', url.base_url, data.object.short, '</td>',
                                            '    <td class="name">', data.object.name, '</td>',
                                            '    <td class="extra">', data.object.extra, '</td>',
                                            '    <td class="hits">',
                                            '        ', data.object.count, '',
                                            '    </td>',
                                            '</tr>',
                                        ].join('')
                                    );
                                    var badge = $('#cat_badge_'+data.object.category_id);
                                    var count = badge.data('count');
                                    badge.data('count', count + 1);
                                    badge.text(badge.text().replace(count, count + 1));
                                } else if ($('#tagAccordion').length !== 0) {
                                    data.object.tags.forEach(function(element, index, array) {
                                        $('#tag_id_'+element.id).append(
                                            [
                                                '<tr id="dolo_id_', data.object.id, '">',
                                                '    <td class="url">', data.object.url, '</td>',
                                                '    <td class="durl">', url.base_url, data.object.short, '</td>',
                                                '    <td class="name">', data.object.name, '</td>',
                                                '    <td class="extra">', data.object.extra, '</td>',
                                                '    <td class="hits">',
                                                '        ', data.object.count, '',
                                                '    </td>',
                                                '</tr>',
                                            ].join('')
                                        );
                                        var badge = $('#tag_badge_'+element.id);
                                        var count = badge.data('count');
                                        badge.data('count', count + 1);
                                        badge.text(badge.text().replace(count, count + 1));
                                    });
                                }
                            }
                            modal.modal('hide');
                            $('.action-remove').unbind('click');
                            $('.action-remove').on('click', aRemove);
                            $('.action-modify').unbind('click');
                            $('.action-modify').on('click', aModify);
                            $('.filter').unbind('keyup');
                            $('.filter').on('keyup', filter);
                        } else {
                            Object.keys(data.errors).forEach(function(element, index, array) {
                                $('#'+element).addClass('failed');
                                data.errors[element].forEach(function(e, i, a) {
                                    $('#'+element).before(['<p class="text-danger error-msg">', e, '</p>'].join(''));
                                });
                            });
                        }
                    }
                });
            });
            break;
        default:
            $('#modalInput').val('');
            $('#modalInput').on('keydown', function(e) {
                if(e.which == 13) {
                    e.preventDefault();
                    $('#confirm').click();
                }
            });
            $('#confirm').click(function() {
                $.ajax({
                    method: 'POST',
                    url: button.data('action'),
                    data: { name: $('#modalInput').val() },
                    dataType: 'json',
                    success: function(data, textStatus, jqXHR) {
                        if (data.success) {
                            addAlert('alert-success', data.msg);
                            modal.modal('hide');
                            if (window.location.pathname.indexOf('dashboard') !== -1) {
                                var selector;
                                switch(add) {
                                    case 'category':
                                        selector = '#cat_nb';
                                        break;
                                    case 'tag':
                                        selector = '#tag_nb';
                                        break;
                                    case 'app':
                                        selector = '#app_nb';
                                        break;
                                }
                                $(selector).text(parseInt($(selector).text()) + 1);
                            } else {
                                switch(add) {
                                    case 'category':
                                        if ($('#catAccordion').length !== 0) {
                                            $('#catAccordion').append(
                                                [
                                                    '<div class="panel panel-default">',
                                                    '    <div class="panel-heading" role="tab" id="heading', window.nextCollapse, '">',
                                                    '        <h4 class="panel-title">',
                                                    '            <a role="button" data-toggle="collapse" data-parent="#catAccordion" href="#collapse', window.nextCollapse, '" aria-expanded="true" aria-controls="collapse', window.nextCollapse, '">',
                                                    '                ', data.object.name, '',
                                                    '            </a>',
                                                    '            <span class="caret" aria-hidden="true" aria-label="', i18n.showMore, '"></span>',
                                                    '            <span class="badge" id="cat_badge_', data.object.id, '" data-count="0">', i18n.zeroDolos, '</span>',
                                                    '            <div class="pull-right">',
                                                    '                <a href="', url.show_cat, data.object.id, '"><span class="glyphicon glyphicon-eye-open" aria-hidden="true" aria-label="', i18n.showCat, '"></span></a>',
                                                    '                <a class="action-modify" href="#" data-id="', data.object.id, '" data-action="', window.mod_url, '" data-mod="category" data-name="', data.object.name, '"><span class="glyphicon glyphicon-pencil" aria-hidden="true" aria-label="', i18n.modCat, '"></span></a>',
                                                    '                <a class="action-remove" href="#" data-id="', data.object.id, '" data-action="', window.del_url, '" data-rm="category" data-name="', data.object.name, '"><span class="glyphicon glyphicon-remove" aria-hidden="true" aria-label="', i18n.rmCat, '"></span></a>',
                                                    '            </div>',
                                                    '        </h4>',
                                                    '    </div>',
                                                    '    <div id="collapse', window.nextCollapse++, '" class="panel-collapse collapse" role="tabpanel">',
                                                    '        <div class="panel-body">',
                                                    '            <div class="table-responsive">',
                                                    '                <table class="table table-hover table-condensed sortable">',
                                                    '                    <thead>',
                                                    '                        <tr>',
                                                    '                            <th>', i18n.url, '</th>',
                                                    '                            <th>', i18n.doloUrl, '</th>',
                                                    '                            <th>', i18n.name, '</th>',
                                                    '                            <th>', i18n.extra, '</th>',
                                                    '                            <th>', i18n.totalHits, '</th>',
                                                    '                            <th></th>',
                                                    '                        </tr>',
                                                    '                        <tr>',
                                                    '                            <td><input class="form-control filter" data-filter=".url" type="text" placeholder="', i18n.filter, '"></td>',
                                                    '                            <td><input class="form-control filter" data-filter=".durl" type="text" placeholder="', i18n.filter, '"></td>',
                                                    '                            <td><input class="form-control filter" data-filter=".name" type="text" placeholder="', i18n.filter, '"></td>',
                                                    '                            <td><input class="form-control filter" data-filter=".extra" type="text" placeholder="', i18n.filter, '"></td>',
                                                    '                            <td><input class="form-control filter" data-filter=".hits" type="text" placeholder="', i18n.filter, '"></td>',
                                                    '                            <td></td>',
                                                    '                        </tr>',
                                                    '                    </thead>',
                                                    '                    <tbody id="cat_id_', data.object.id, '">',
                                                    '                    </tbody>',
                                                    '                </table>',
                                                    '            </div>',
                                                    '        </div>',
                                                    '    </div>',
                                                    '</div>',
                                                ].join('')
                                            )
                                        }
                                        break;
                                    case 'tag':
                                        if ($('#tagAccordion').length !== 0) {
                                            $('#tagAccordion').append(
                                                [
                                                    '<div class="panel panel-default">',
                                                    '    <div class="panel-heading" role="tab" id="heading', window.nextCollapse, '">',
                                                    '        <h4 class="panel-title">',
                                                    '            <a role="button" data-toggle="collapse" data-parent="#tagAccordion" href="#collapse', window.nextCollapse, '" aria-expanded="true" aria-controls="collapse', window.nextCollapse, '">',
                                                    '                ', data.object.name, '',
                                                    '            </a>',
                                                    '            <span class="caret" aria-hidden="true" aria-label="', i18n.showMore, '"></span>',
                                                    '            <span class="badge" id="tag_badge_', data.object.id, '" data-count="0">', i18n.zeroDolos, '</span>',
                                                    '            <div class="pull-right">',
                                                    '                <a href="', url.show_tag, data.object.id, '"><span class="glyphicon glyphicon-eye-open" aria-hidden="true" aria-label="', i18n.showTag, '"></span></a>',
                                                    '                <a class="action-modify" href="#" data-id="', data.object.id, '" data-action="', window.mod_url, '" data-mod="tag" data-name="', data.object.name, '"><span class="glyphicon glyphicon-pencil" aria-hidden="true" aria-label="', i18n.modTag, '"></span></a>',
                                                    '                <a class="action-remove" href="#" data-id="', data.object.id, '" data-action="', window.del_url, '" data-rm="tag" data-name="', data.object.name, '"><span class="glyphicon glyphicon-remove" aria-hidden="true" aria-label="', i18n.rmTag, '"></span></a>',
                                                    '            </div>',
                                                    '        </h4>',
                                                    '    </div>',
                                                    '    <div id="collapse', window.nextCollapse++, '" class="panel-collapse collapse" role="tabpanel">',
                                                    '        <div class="panel-body">',
                                                    '            <div class="table-responsive">',
                                                    '                <table class="table table-hover table-condensed sortable">',
                                                    '                    <thead>',
                                                    '                        <tr>',
                                                    '                            <th>', i18n.url, '</th>',
                                                    '                            <th>', i18n.doloUrl, '</th>',
                                                    '                            <th>', i18n.name, '</th>',
                                                    '                            <th>', i18n.extra, '</th>',
                                                    '                            <th>', i18n.totalHits, '</th>',
                                                    '                            <th></th>',
                                                    '                        </tr>',
                                                    '                        <tr>',
                                                    '                            <td><input class="form-control filter" data-filter=".url" type="text" placeholder="', i18n.filter, '"></td>',
                                                    '                            <td><input class="form-control filter" data-filter=".durl" type="text" placeholder="', i18n.filter, '"></td>',
                                                    '                            <td><input class="form-control filter" data-filter=".name" type="text" placeholder="', i18n.filter, '"></td>',
                                                    '                            <td><input class="form-control filter" data-filter=".extra" type="text" placeholder="', i18n.filter, '"></td>',
                                                    '                            <td><input class="form-control filter" data-filter=".hits" type="text" placeholder="', i18n.filter, '"></td>',
                                                    '                            <td></td>',
                                                    '                        </tr>',
                                                    '                    </thead>',
                                                    '                    <tbody id="tag_id_', data.object.id, '">',
                                                    '                    </tbody>',
                                                    '                </table>',
                                                    '            </div>',
                                                    '        </div>',
                                                    '    </div>',
                                                    '</div>',
                                                ].join('')
                                            )
                                        }
                                        break;
                                    case 'app':
                                        if ($('#appTbody').length !== 0) {
                                            $('#appTbody').append(
                                                [
                                                    '<tr>',
                                                    '    <td class="name">', data.object.name,'</td>',
                                                    '    <td class="app-id">', data.object.app_id,'</td>',
                                                    '    <td class="app-secret">',
                                                             data.object.app_secret,
                                                    '        <div class="pull-right">',
                                                    '            <a class="action-modify" href="#" data-id="', data.object.id, '" data-action="', window.mod_url, '" data-mod="app" data-name="', data.object.name, '">',
                                                    '                <span class="glyphicon glyphicon-pencil" aria-hidden="true" aria-label="', i18n.modApp, '"></span>',
                                                    '            </a>',
                                                    '            <a class="action-remove" href="#" data-id="', data.object.id, '" data-action="', window.del_url, '" data-rm="app" data-name="', data.object.name, '">',
                                                    '                <span class="glyphicon glyphicon-remove" aria-hidden="true" aria-label="', i18n.rmApp, '"></span>',
                                                    '            </a>',
                                                    '        </div>',
                                                        '</td>',
                                                    '</tr>',
                                                ].join('')
                                            );
                                        }
                                        break;
                                }
                            }
                            $('.action-remove').unbind('click');
                            $('.action-remove').on('click', aRemove);
                            $('.action-modify').unbind('click');
                            $('.action-modify').on('click', aModify);
                            $('.filter').unbind('keyup');
                            $('.filter').on('keyup', filter);
                        } else {
                            $('#modalInput').addClass('failed');
                            $('#modalInput').before(['<p class="text-danger">', data.msg, '</p>'].join(''));
                        }
                    }
                })
            });
    }
})