(function () {
    'use strict';

    // 1. Компонент каталога
    function AnimeComponent() {
        var network = new Lampa.Request();
        var scroll;
        var html = $('<div class="category-full"></div>');

        this.create = function () {
            scroll = new Lampa.Scroll({mask: true, over: true});
            scroll.append(html);
            Lampa.Loading.start();
            this.load();
            return scroll.render();
        };

        this.load = function () {
            var _this = this;
            var url = 'discover/tv?with_genres=16&with_original_language=ja&language=ru-RU&sort_by=popularity.desc';
            network.api(url, function (json) {
                Lampa.Loading.stop();
                if (json && json.results) _this.build(json.results);
                else html.html('<div class="empty">Список пуст</div>');
            }, function () {
                Lampa.Loading.stop();
                html.html('<div class="empty">Ошибка сети</div>');
            });
        };

        this.build = function (results) {
            html.empty();
            results.forEach(function (item) {
                var card = new Lampa.Card({
                    title: item.name || item.original_name,
                    img: 'https://image.tmdb.org/t/p/w500' + item.poster_path,
                    year: item.first_air_date ? item.first_air_date.split('-')[0] : ''
                });
                card.create();
                card.on('click', function () {
                    Lampa.Search.open({ query: item.name || item.original_name });
                });
                html.append(card.render());
            });
            Lampa.Controller.enable('content');
        };

        this.render = function () { return scroll ? scroll.render() : ''; };
        this.destroy = function () { network.clear(); if(scroll) scroll.destroy(); };
    }

    // Регистрация компонента
    Lampa.Component.add('anime_final_hijack', AnimeComponent);

    // ФУНКЦИЯ ВСТАВКИ (Прямая инъекция в DOM)
    function injectToMenu() {
        if ($('.menu [data-action="anime_final_hijack"]').length) return;

        // Находим любой пункт меню, чтобы прицепиться к нему
        var target = $('.menu [data-action="tv"], .menu [data-action="movie"], .menu__item').first();
        
        if (target.length) {
            var menu_item = $(`
                <div class="menu__item selector" data-action="anime_final_hijack">
                    <div class="menu__ico">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
                        </svg>
                    </div>
                    <div class="menu__text">Аниме</div>
                </div>
            `);

            menu_item.on('click', function () {
                Lampa.Activity.push({
                    title: 'Аниме Онлайн',
                    component: 'anime_final_hijack'
                });
                // Закрываем меню после клика (для мобильных и ТВ)
                Lampa.Menu.hide ? Lampa.Menu.hide() : $('.menu').removeClass('active');
            });

            // Вставляем после Сериалов или Фильмов
            if ($('.menu [data-action="tv"]').length) $('.menu [data-action="tv"]').after(menu_item);
            else if ($('.menu [data-action="movie"]').length) $('.menu [data-action="movie"]').after(menu_item);
            else target.parent().append(menu_item);
        }
    }

    // ГЛАВНЫЙ МЕХАНИЗМ: Слежка за DOM
    // Каждые 1.5 секунды проверяем, не исчез ли наш пункт (Lampac любит удалять чужое)
    setInterval(injectToMenu, 1500);

    // Дополнительный вызов при любом клике по меню
    $(document).on('click', '.menu__item', function() {
        setTimeout(injectToMenu, 100);
    });

})();
