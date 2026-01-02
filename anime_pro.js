(function () {
    'use strict';

    function AnimeComponent() {
        var scroll;
        var html = $('<div class="category-full"></div>');

        this.create = function () {
            scroll = new Lampa.Scroll({mask: true, over: true});
            scroll.append(html);
            this.load();
            return scroll.render();
        };

        this.load = function () {
            var _this = this;
            Lampa.Loading.start();

            // Прямой запрос к TMDB с универсальным ключом
            var url = 'https://api.themoviedb.org/3/discover/tv?api_key=4ef0d35509cc14c9ef8952448ca32757&with_genres=16&with_original_language=ja&language=ru-RU&sort_by=popularity.desc';

            $.ajax({
                url: url,
                method: 'GET',
                dataType: 'json',
                success: function (json) {
                    Lampa.Loading.stop();
                    if (json && json.results && json.results.length) {
                        _this.build(json.results);
                    } else {
                        _this.empty('TMDB вернул пустой список. Попробуйте обновить страницу.');
                    }
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    Lampa.Loading.stop();
                    // Если прямой запрос заблокирован (CORS), пробуем через прокси CUB
                    var proxyUrl = 'https://cors-anywhere.herokuapp.com/' + url; // Крайний случай
                    _this.empty('Ошибка доступа к TMDB. Пожалуйста, включите прокси в настройках Lampa (Раздел TMDB).');
                    console.error('Anime Plugin Error:', textStatus, errorThrown);
                }
            });
        };

        this.build = function (results) {
            html.empty();
            results.forEach(function (item) {
                if (!item.poster_path) return;

                var card = new Lampa.Card({
                    title: item.name || item.original_name,
                    img: 'https://image.tmdb.org/t/p/w500' + item.poster_path,
                    year: item.first_air_date ? item.first_air_date.split('-')[0] : ''
                });

                card.create();
                card.on('click', function () {
                    Lampa.Activity.push({
                        title: item.name || item.original_name,
                        component: 'full',
                        id: item.id,
                        method: 'tv',
                        card: item
                    });
                });

                html.append(card.render());
            });
            Lampa.Controller.enable('content');
        };

        this.empty = function(msg) {
            html.html('<div style="text-align:center; margin-top:100px; color:#fff; padding:20px; font-size:18px;">' + msg + '</div>');
        };

        this.render = function () { return scroll.render(); };
        this.destroy = function () { if(scroll) scroll.destroy(); };
    }

    Lampa.Component.add('anime_final_v46', AnimeComponent);

    function inject() {
        if ($('.menu [data-action="anime_v46"]').length) return;
        var list = $('.menu .menu__list, .menu__list');
        if (list.length) {
            var item = $(`
                <div class="menu__item selector" data-action="anime_v46">
                    <div class="menu__ico">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>
                    </div>
                    <div class="menu__text">Аниме</div>
                </div>
            `);
            item.on('click', function () {
                Lampa.Activity.push({ title: 'Аниме Онлайн', component: 'anime_final_v46' });
            });
            var tv = list.find('[data-action="tv"]');
            if (tv.length) tv.after(item); else list.append(item);
        }
    }
    setInterval(inject, 2000);
})();
