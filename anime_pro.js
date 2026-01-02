(function () {
    'use strict';

    function AnimeOnline(object) {
        var network = new Lampa.Request();
        var scroll  = new Lampa.Scroll({mask: true, over: true});
        var items   = [];
        var html    = $('<div class="anime-online"></div>');
        var body    = $('<div class="category-full"></div>');
        
        this.create = function () {
            var _this = this;
            html.append(scroll.render());
            scroll.append(body);
            this.load();
            return html;
        };

        this.load = function () {
            var _this = this;
            Lampa.Loading.start();
            // Используем проверенный эндпоинт Shikimori
            var url = 'https://shikimori.one/api/animes?limit=50&order=popularity&kind=tv';

            network.silent(url, function (json) {
                Lampa.Loading.stop();
                if (json && json.length) {
                    _this.build(json);
                }
            }, function () {
                Lampa.Loading.stop();
                Lampa.Noty.show('Ошибка загрузки каталога');
            });
        };

        this.build = function (json) {
            var _this = this;
            json.forEach(function (item) {
                var card_data = {
                    title: item.russian || item.name,
                    img: 'https://shikimori.one' + item.image.original,
                    year: item.aired_on ? item.aired_on.split('-')[0] : ''
                };

                var card = new Lampa.Card(card_data);
                card.create();

                // ГЛАВНЫЙ МОМЕНТ: Логика как в online_mod.js
                card.on('click', function () {
                    // Формируем объект для парсера Lampa
                    var search_item = {
                        title: card_data.title,
                        original_title: item.name,
                        year: card_data.year,
                        method: 'anime'
                    };

                    // Вызываем окно поиска видео (Online)
                    // Это заставит Lampa искать озвучку через Rezka, Vokino и др.
                    Lampa.Component.add('full', {
                        card: search_item,
                        id: item.id,
                        source: 'shikimori'
                    });

                    // Принудительно запускаем поиск видео-балансеров
                    Lampa.Player.run_video = true; // Подсказка системе
                    Lampa.Controller.toggle('content');
                });

                body.append(card.render());
            });
            Lampa.Controller.enable('content');
        };

        this.render = function () { return html; };
        this.destroy = function () { network.clear(); scroll.destroy(); html.remove(); };
    }

    function startPlugin() {
        // Регистрируем компонент
        Lampa.Component.add('anime_online', AnimeOnline);

        // Добавляем в главное меню официально
        var addMenuItem = function() {
            var menu_item = $('<div class="menu__item selector" data-action="anime_online">' +
                '<div class="menu__ico"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M10 8l6 4-6 4V8z"></path></svg></div>' +
                '<div class="menu__text">Аниме Онлайн</div>' +
            '</div>');

            menu_item.on('click', function () {
                Lampa.Activity.push({
                    title: 'Аниме Онлайн',
                    component: 'anime_online',
                    page: 1
                });
            });
            $('.menu .menu__list').append(menu_item);
        };

        if (window.appready) addMenuItem();
        else Lampa.Listener.follow('app', function (e) { if (e.type == 'ready') addMenuItem(); });
    }

    startPlugin();
})();
