(function () {
    'use strict';

    function AnimePlugin() {
        var network = new Lampa.Reguest();
        var scroll;
        var html = $('<div class="anime-standalone-v16" style="width:100%; height:100%; background:#141414;"></div>');
        var container = $('<div class="anime-grid" style="display:flex; flex-wrap:wrap; padding:20px; gap:10px; justify-content: center;"></div>');
        var active_params = 'order=ranked';

        var tabs = [
            {title: 'Топ', params: 'order=ranked'},
            {title: 'Онгоинги', params: 'status=ongoing'},
            {title: '18+', params: 'rating=rx,r_plus&censored=false'}
        ];

        this.create = function () {
            var _this = this;
            
            // Панель вкладок
            var header = $('<div style="height:60px; display:flex; align-items:center; padding:0 30px; border-bottom:1px solid #333; background: #1a1a1a;"></div>');
            tabs.forEach(function(tab) {
                var btn = $('<div class="selector" style="margin-right:25px; cursor:pointer; font-weight:bold; font-size:18px; opacity:0.6; transition: 0.2s;">' + tab.title + '</div>');
                btn.on('click', function() {
                    header.find('div').css({'opacity': 0.6, 'color': '#fff'});
                    $(this).css({'opacity': 1, 'color': '#ff3e3e'});
                    _this.load(tab.params);
                });
                header.append(btn);
            });

            scroll = new Lampa.Scroll({mask: true, over: true});
            html.append(header).append(scroll.render());
            scroll.append(container);

            this.load(active_params);
            return html;
        };

        this.load = function (params) {
            var _this = this;
            Lampa.Loading.start();
            container.empty();
            
            var url = 'https://corsproxy.io/?' + encodeURIComponent('https://shikimori.one/api/animes?limit=50&' + params);

            network.silent(url, function (json) {
                Lampa.Loading.stop();
                if (json && json.length) {
                    json.forEach(function (item) {
                        var name = item.russian || item.name;
                        var card = $(
                            '<div class="selector" style="width:150px; margin:10px; cursor:pointer; transition: transform 0.2s;">' +
                                '<img src="https://shikimori.one' + item.image.original + '" style="width:100%; border-radius:8px; height:215px; object-fit:cover; box-shadow: 0 5px 15px rgba(0,0,0,0.4);">' +
                                '<div style="font-size:13px; margin-top:8px; text-align:center; height:32px; overflow:hidden; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical;">' + name + '</div>' +
                            '</div>'
                        );

                        card.on('click', function() {
                            // Самый надежный метод: вызываем глобальный поиск по названию
                            Lampa.Search.open({
                                query: name
                            });
                        });

                        container.append(card);
                    });
                    Lampa.Controller.enable('content');
                }
            }, function () {
                Lampa.Loading.stop();
                Lampa.Noty.show('Ошибка загрузки Shikimori');
            });
        };

        this.render = function () { return html; };
        this.destroy = function () { network.clear(); scroll.destroy(); html.remove(); };
    }

    function startPlugin() {
        Lampa.Component.add('anime_v16', AnimePlugin);
        var menu_item = $('<div class="menu__item selector" data-action="anime_v16">' +
            '<div class="menu__ico"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg></div>' +
            '<div class="menu__text">Аниме Плюс</div>' +
        '</div>');

        menu_item.on('click', function () {
            Lampa.Activity.push({ title: 'Аниме Плюс', component: 'anime_v16' });
        });
        $('.menu .menu__list').append(menu_item);
    }

    if (window.appready) startPlugin();
    else Lampa.Listener.follow('app', function (e) { if (e.type == 'ready') startPlugin(); });
})();
