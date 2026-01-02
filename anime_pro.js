(function () {
    'use strict';

    function AnimePlugin() {
        var network = new Lampa.Reguest();
        var scroll;
        var html = $('<div class="anime-standalone-v17" style="width:100%; height:100%; background:#141414;"></div>');
        var container = $('<div class="anime-grid" style="display:flex; flex-wrap:wrap; padding:20px; gap:10px; justify-content: center;"></div>');
        
        var tabs = [
            {title: 'Топ', params: 'order=ranked'},
            {title: 'Онгоинги', params: 'status=ongoing'},
            {title: '18+', params: 'rating=rx,r_plus&censored=false'}
        ];

        this.create = function () {
            var _this = this;
            var header = $('<div style="height:60px; display:flex; align-items:center; padding:0 30px; border-bottom:1px solid #333; background: #1a1a1a;"></div>');
            
            tabs.forEach(function(tab, i) {
                var btn = $('<div class="selector" style="margin-right:25px; cursor:pointer; font-weight:bold; font-size:16px; opacity:0.6;">' + tab.title + '</div>');
                if (i === 0) btn.css({'opacity': 1, 'color': '#ff3e3e'});
                
                btn.on('click', function() {
                    header.find('.selector').css({'opacity': 0.6, 'color': '#fff'});
                    $(this).css({'opacity': 1, 'color': '#ff3e3e'});
                    _this.load(tab.params);
                });
                header.append(btn);
            });

            scroll = new Lampa.Scroll({mask: true, over: true});
            html.append(header).append(scroll.render());
            scroll.append(container);

            this.load(tabs[0].params);
            return html;
        };

        this.load = function (params) {
            var _this = this;
            Lampa.Loading.start();
            container.empty();
            
            // Добавляем случайный параметр, чтобы обмануть кэш и избежать ошибки oncomplite
            var url = 'https://corsproxy.io/?' + encodeURIComponent('https://shikimori.one/api/animes?limit=50&' + params + '&cache_stop=' + Math.random());

            network.silent(url, function (json) {
                Lampa.Loading.stop();
                if (json && json.length) {
                    json.forEach(function (item) {
                        var name = item.russian || item.name;
                        var card = $(
                            '<div class="selector" style="width:150px; margin:10px; cursor:pointer;">' +
                                '<img src="https://shikimori.one' + item.image.original + '" style="width:100%; border-radius:8px; height:215px; object-fit:cover; box-shadow: 0 5px 15px rgba(0,0,0,0.4);">' +
                                '<div style="font-size:13px; margin-top:8px; text-align:center; height:32px; overflow:hidden; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; line-height: 1.2;">' + name + '</div>' +
                            '</div>'
                        );

                        // Используем самый простой способ вызова поиска, который точно есть в ядре
                        card.on('click', function() {
                            Lampa.Input.edit({
                                value: name,
                                free: true,
                                title: 'Поиск аниме'
                            }, function (new_value) {
                                if (new_value) Lampa.Search.open({ query: new_value });
                            });
                        });

                        container.append(card);
                    });
                    Lampa.Controller.enable('content');
                }
            }, function () {
                Lampa.Loading.stop();
                container.append('<div style="text-align:center;width:100%;padding:50px;">Ошибка загрузки API. Попробуйте сменить вкладку.</div>');
            });
        };

        this.render = function () { return html; };
        this.destroy = function () { network.clear(); scroll.destroy(); html.remove(); };
    }

    function startPlugin() {
        Lampa.Component.add('anime_v17', AnimePlugin);
        
        var menu_item = $('<div class="menu__item selector" data-action="anime_v17">' +
            '<div class="menu__ico"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg></div>' +
            '<div class="menu__text">Аниме Fix</div>' +
        '</div>');

        menu_item.on('click', function () {
            Lampa.Activity.push({
                title: 'Аниме Fix',
                component: 'anime_v17'
            });
        });

        $('.menu .menu__list').append(menu_item);
    }

    if (window.appready) startPlugin();
    else Lampa.Listener.follow('app', function (e) { if (e.type == 'ready') startPlugin(); });
})();
