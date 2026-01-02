(function () {
    'use strict';

    function AnimePlugin() {
        var network = new Lampa.Reguest();
        var scroll;
        var html = $('<div class="anime-v20" style="width:100%; height:100%; background:#141414;"></div>');
        var container = $('<div class="anime-grid" style="display:flex; flex-wrap:wrap; padding:20px; gap:10px; justify-content: center;"></div>');
        
        this.create = function () {
            var _this = this;
            var header = $('<div style="height:60px; display:flex; align-items:center; padding:0 30px; border-bottom:1px solid #333; background: #1a1a1a;"><div style="font-weight:bold; color:#ff3e3e; font-size:18px;">Аниме с русской озвучкой</div></div>');
            
            scroll = new Lampa.Scroll({mask: true, over: true});
            html.append(header).append(scroll.render());
            scroll.append(container);

            this.load('order=ranked');
            return html;
        };

        this.load = function (params) {
            var _this = this;
            Lampa.Loading.start();
            var url = 'https://corsproxy.io/?' + encodeURIComponent('https://shikimori.one/api/animes?limit=50&' + params);

            network.silent(url, function (json) {
                Lampa.Loading.stop();
                json.forEach(function (item) {
                    var name = item.russian || item.name;
                    var card = $(
                        '<div class="selector" style="width:150px; margin:10px; cursor:pointer;">' +
                            '<img src="https://shikimori.one' + item.image.original + '" style="width:100%; border-radius:8px; height:215px; object-fit:cover;">' +
                            '<div style="font-size:13px; margin-top:8px; text-align:center; height:32px; overflow:hidden;">' + name + '</div>' +
                        '</div>'
                    );

                    // ГЛАВНОЕ: Кнопка действия
                    card.on('click', function() {
                        // 1. Пытаемся вызвать окно выбора (Торренты / Онлайн)
                        Lampa.Component.add('anime_full', {}); // Заглушка, чтобы не было ошибки старта
                        
                        // 2. Вызываем глобальный поиск — он автоматически подхватит установленные у вас озвучки
                        Lampa.Search.open({
                            query: name
                        });
                        
                        Lampa.Noty.show('Ищем видео для: ' + name);
                    });

                    container.append(card);
                });
                Lampa.Controller.enable('content');
            }, function () {
                Lampa.Loading.stop();
            });
        };

        this.render = function () { return html; };
        this.destroy = function () { network.clear(); scroll.destroy(); html.remove(); };
    }

    function startPlugin() {
        Lampa.Component.add('anime_v20', AnimePlugin);
        var menu_item = $('<div class="menu__item selector" data-action="anime_v20">' +
            '<div class="menu__ico"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg></div>' +
            '<div class="menu__text">Смотреть Аниме</div>' +
        '</div>');
        menu_item.on('click', function () {
            Lampa.Activity.push({ title: 'Аниме', component: 'anime_v20' });
        });
        $('.menu .menu__list').append(menu_item);
    }

    if (window.appready) startPlugin();
    else Lampa.Listener.follow('app', function (e) { if (e.type == 'ready') startPlugin(); });
})();
