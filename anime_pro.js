(function () {
    'use strict';

    function AnimeTMDB() {
        var network = new Lampa.Request();
        var scroll  = new Lampa.Scroll({ mask: true, over: true });
        var html    = $('<div class="category-full"></div>');

        this.create = function () {
            scroll.append(html);          // ✅ ОДИН РАЗ
            this.load();
            return scroll.render();
        };

        this.load = function () {
            var _this = this;
            Lampa.Loading.start();

            var url = 'discover/tv' +
                '?with_genres=16' +
                '&with_original_language=ja' +
                '&language=ru-RU' +
                '&sort_by=popularity.desc';

            network.api(url, function (json) {
                Lampa.Loading.stop();
                if (json && Array.isArray(json.results) && json.results.length) {
                    _this.build(json.results);
                } else {
                    Lampa.Noty.show('Аниме: список пуст');
                }
            }, function () {
                Lampa.Loading.stop();
                Lampa.Noty.show('Аниме: ошибка сети');
            });
        };

        this.build = function (results) {
            html.empty();

            results.forEach(function (item) {
                if (!item.poster_path) return;

                var title = item.name || item.original_name;
                if (!title) return;

                var card = new Lampa.Card({
                    title: title,
                    img: 'https://image.tmdb.org/t/p/w500' + item.poster_path,
                    year: item.first_air_date ? item.first_air_date.split('-')[0] : ''
