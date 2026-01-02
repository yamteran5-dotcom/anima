(function () {
    'use strict';

    function AnimePlugin() {
        var network = new Lampa.Request();
        var scroll;
        var html = $('<div class="anime-v23" style="width:100%; height:100%; background:#141414;"></div>');
        var container = $('<div class="anime-grid" style="display:flex; flex-wrap:wrap; padding:20px; gap:10px; justify-content: center;"></div>');
        
        this.create = function () {
            var _this = this;
            var header = $('<div style="height:60px; display:flex; align-items:center; padding:0 30px; border-bottom:1px solid #333; background: #1a1a1a;"><div style="font-weight:bold; color:#ff3e3e; font-size:18px;">Аниме Онлайн (HD Резка / CDN)</div></div>');
            scroll = new Lampa.Scroll({mask: true, over: true});
            html.append(header).append(scroll.render());
            scroll.append(container);
            this.load();
            return html;
        };

        this.load = function () {
            var _this = this;
            Lampa.Loading.start();
            // Используем официальный прокси Lampa, чтобы не было "пусто"
            var url = 'https://corsproxy.io/?' + encodeURIComponent('https://shikimori.one/api/animes?limit=50&order=popularity');

            network.silent(url, function (json) {
                Lampa.Loading.stop();
                if (json && json.length) {
                    json.forEach(function (item) {
                        var name = item.russian || item.name;
                        var card = $(
                            '<div class="selector" style="width:150px; margin:10px; cursor:pointer;">' +
                                '<img src="https://shikimori.one' + item.image.original + '" style="width:100%; border-radius:8px; height:215px; object-fit:cover; box-shadow: 0 5px 15px rgba(0,0,0,0.5);">' +
                                '<div style="font-size:13px; margin-top:8px; text-align:center; height:32px; overflow:hidden;">' + name + '</div>' +
                            '</div>'
                        );

                        // КЛИК ДЛЯ ПРОСМОТРА
                        card.on('click', function() {
                            // 1. Создаем "виртуальную" карточку для плеера
                            var movie = {
                                title: name,
                                original_title: item.name,
                                name: name,
                                img: 'https://shikimori.one' + item.image.original,
                                year: item.aired_on ? item.aired_on.split('-')[0] : '',
                                method: 'anime'
                            };

                            // 2. Вызываем системное окно выбора озвучек
                            // Это задействует ваши установленные плагины (Rezka, Vokino и т.д.)
                            Lampa.Component.add('full', {}); 
                            Lampa.Search.open({ query: name }); 
                            Lampa.Noty.show('Поиск видео на русском...');
                        });

                        container.append(card);
                    });
                    Lampa.Controller.enable('content');
                }
            }, function () {
                Lampa.Loading.stop();
                Lampa.Noty.show('Ошибка: Shikimori недоступен');
            });
        };

        this.render = function () { return html; };
        this.destroy = function () { network.clear(); scroll.destroy(); html.remove(); };
    }

    function startPlugin() {
        Lampa.Component.add('anime_v23', AnimePlugin);
        var menu_item = $('<div class="menu__item selector" data-action="anime_v23">' +
            '<div class="menu__ico"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M10 8l6 4-6 4V8z"></path><circle cx="12" cy="12" r="10"></circle></svg></div>' +
            '<div class="menu__text">Аниме Онлайн</div>' +
        '</div>');

        menu_item.on('click', function () {
            Lampa.Activity.push({ title: 'Аниме Онлайн', component: 'anime_v23' });
        });
        $('.menu .menu__list').append(menu_item);
    }

    if (window.appready) startPlugin();
    else Lampa.Listener.follow('app', function (e) { if (e.type == 'ready') startPlugin(); });
})();
