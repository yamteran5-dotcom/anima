(function () {
    'use strict';

    function AnimePlugin() {
        var network = new Lampa.Reguest();
        var scroll;
        var html = $('<div class="anime-standalone-v15" style="width:100%; height:100%; background:#141414; position:relative;"></div>');
        var container = $('<div class="anime-grid" style="display:flex; flex-wrap:wrap; padding:20px; gap:15px;"></div>');
        var info_panel = $('<div class="anime-panel" style="display:none; position:absolute; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.95); z-index:100; padding:50px;"></div>');

        var tabs = [
            {title: 'Топ', params: 'order=ranked'},
            {title: 'Онгоинги', params: 'status=ongoing'},
            {title: '18+', params: 'rating=rx,r_plus&censored=false'}
        ];

        this.create = function () {
            var _this = this;
            
            // Шапка со вкладками
            var header = $('<div style="height:50px; display:flex; align-items:center; padding:0 20px; border-bottom:1px solid #333;"></div>');
            tabs.forEach(function(tab, i) {
                var btn = $('<div class="selector" style="margin-right:20px; cursor:pointer; font-weight:bold; opacity:0.6;">' + tab.title + '</div>');
                btn.on('click', function() {
                    header.find('div').css('opacity', 0.6);
                    $(this).css('opacity', 1);
                    _this.load(tab.params);
                });
                if(i === 0) btn.css('opacity', 1);
                header.append(btn);
            });

            scroll = new Lampa.Scroll({mask: true, over: true});
            html.append(header).append(scroll.render()).append(info_panel);
            scroll.append(container);

            this.load(tabs[0].params);
            return html;
        };

        this.load = function (params) {
            var _this = this;
            Lampa.Loading.start();
            container.empty();
            
            var url = 'https://corsproxy.io/?' + encodeURIComponent('https://shikimori.one/api/animes?limit=40&' + params);

            network.silent(url, function (json) {
                Lampa.Loading.stop();
                json.forEach(function (item) {
                    var card = $(
                        '<div class="selector" style="width:160px; cursor:pointer;">' +
                            '<img src="https://shikimori.one' + item.image.original + '" style="width:100%; border-radius:10px; height:230px; object-fit:cover; margin-bottom:8px; border: 2px solid transparent;">' +
                            '<div style="font-size:14px; text-align:center; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">' + (item.russian || item.name) + '</div>' +
                        '</div>'
                    );

                    card.on('click', function() {
                        _this.showDetails(item);
                    });

                    container.append(card);
                });
                Lampa.Controller.enable('content');
            });
        };

        this.showDetails = function(item) {
            info_panel.empty().fadeIn(300);
            var content = $(
                '<div style="display:flex; height:100%;">' +
                    '<div style="width:300px; margin-right:50px;"><img src="https://shikimori.one' + item.image.original + '" style="width:100%; border-radius:15px; box-shadow: 0 0 30px rgba(0,0,0,0.8);"></div>' +
                    '<div style="flex:1;">' +
                        '<div style="font-size:40px; font-weight:bold; margin-bottom:20px;">' + (item.russian || item.name) + '</div>' +
                        '<div style="font-size:18px; color:#aaa; margin-bottom:30px;">Рейтинг: ' + item.score + ' | Тип: ' + item.kind.toUpperCase() + '</div>' +
                        '<div class="selector" id="start_watch" style="background:#fff; color:#000; padding:15px 40px; display:inline-block; border-radius:50px; font-weight:bold; cursor:pointer;">Искать и Смотреть</div>' +
                        '<div class="selector" id="close_panel" style="margin-left:20px; padding:15px; display:inline-block; cursor:pointer; opacity:0.5;">[Закрыть]</div>' +
                    '</div>' +
                '</div>'
            );

            content.find('#close_panel').on('click', function() { info_panel.fadeOut(200); });
            content.find('#start_watch').on('click', function() {
                info_panel.hide();
                Lampa.Api.search({ query: item.russian || item.name }); 
            });

            info_panel.append(content);
        };

        this.render = function () { return html; };
        this.destroy = function () { network.clear(); scroll.destroy(); html.remove(); };
    }

    function startPlugin() {
        Lampa.Component.add('anime_v15', AnimePlugin);
        var menu_item = $('<div class="menu__item selector" data-action="anime_v15">' +
            '<div class="menu__ico"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg></div>' +
            '<div class="menu__text">Аниме v15</div>' +
        '</div>');

        menu_item.on('click', function () {
            Lampa.Activity.push({ title: 'Аниме v15', component: 'anime_v15' });
        });
        $('.menu .menu__list').append(menu_item);
    }

    if (window.appready) startPlugin();
    else Lampa.Listener.follow('app', function (e) { if (e.type == 'ready') startPlugin(); });
})();
