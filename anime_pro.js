(function () {
    'use strict';

    function AnimePlugin() {
        // Ошибка №1 исправлена: корректный объект Request
        var network = new Lampa.Request(); 
        var scroll;
        var items = [];
        var html = $('<div class="anime-v21"></div>');
        var container = $('<div class="category-full"></div>');
        
        this.create = function () {
            var _this = this;
            scroll = new Lampa.Scroll({mask: true, over: true});
            html.append(scroll.render());
            scroll.append(container);
            this.load();
            return html;
        };

        this.load = function () {
            var _this = this;
            Lampa.Loading.start();
            
            // Ошибка №2 и №3: Прямой запрос к API через прокси Lampa (если доступно) 
            // или использование более стабильного заголовка
            var url = 'https://shikimori.one/api/animes?limit=50&order=ranked';

            network.silent(url, function (json) {
                Lampa.Loading.stop();
                if (json && json.length) {
                    _this.build(json);
                }
            }, function () {
                Lampa.Loading.stop();
                Lampa.Noty.show('Ошибка загрузки API Shikimori');
            });
        };

        this.build = function (json) {
            var _this = this;
            json.forEach(function (item) {
                var name = item.russian || item.name;
                
                // Используем штатный конструктор карточек Lampa
                var card = new Lampa.Card({
                    title: name,
                    img: 'https://shikimori.one' + item.image.original,
                    year: item.aired_on ? item.aired_on.split('-')[0] : ''
                });

                card.create();
                
                // Передача в поиск для просмотра видео на русском
                card.on('click', function () {
                    Lampa.Search.open({
                        query: name
                    });
                });

                container.append(card.render());
            });
            Lampa.Controller.enable('content');
        };

        this.render = function () { return html; };
        this.destroy = function () { network.clear(); scroll.destroy(); html.remove(); };
    }

    // Исправление ошибки №4: Регистрация через официальный API Lampa
    function startPlugin() {
        // Регистрация компонента в системе
        Lampa.Component.add('anime_v21', AnimePlugin);

        // Правильное добавление в меню через массив Lampa.Menu (сохраняется при перезагрузке)
        Lampa.Listener.follow('app', function (e) {
            if (e.type == 'ready') {
                var menu_item = {
                    title: 'Аниме Про',
                    component: 'anime_v21',
                    icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>'
                };
                
                // Добавляем в список доступных разделов
                if (Lampa.Menu && Lampa.Menu.add) {
                    Lampa.Menu.add(menu_item);
                }
            }
        });
    }

    if (window.appready) startPlugin();
    else Lampa.Listener.follow('app', function (e) { if (e.type == 'ready') startPlugin(); });
})();
