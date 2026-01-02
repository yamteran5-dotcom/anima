(function () {
    'use strict';

    function AnimeComponent(object) {
        var network = new Lampa.Request();
        var scroll;
        var items = [];
        var html = $('<div class="category-full"></div>');
        var active_tab = object.tab || 'popular';

        // Определяем категории и их параметры для TMDB
        var categories = {
            ongoing: 'discover/tv?with_genres=16&with_original_language=ja&air_date.gte=' + new Date().toISOString().split('t')[0] + '&sort_by=popularity.desc',
            watching: 'tv/trending/day?with_genres=16', // Условный трендинг
            popular: 'discover/tv?with_genres=16&with_original_language=ja&sort_by=popularity.desc',
            top100: 'discover/tv?with_genres=16&with_original_language=ja&sort_by=vote_average.desc&vote_count.gte=1000',
            adult: 'discover/tv?with_genres=16&include_adult=true&sort_by=popularity.desc'
        };

        this.create = function () {
            var _this = this;
            scroll = new Lampa.Scroll({mask: true, over: true});
            
            // Создаем вкладки
            this.buildTabs();
            
            scroll.append(html);
            this.load();
            return scroll.render();
        };

        this.buildTabs = function(){
            var tabs = [
                {title: 'Онгоинги', id: 'ongoing'},
                {title: 'Сейчас смотрят', id: 'watching'},
                {title: 'Популярное', id: 'popular'},
                {title: 'Топ 100', id: 'top100'},
                {title: '18+', id: 'adult'}
            ];

            var tabs_html = $('<div class="category-tabs"></div>');
            tabs.forEach(function(tab){
                var item = $('<div class="category-tabs__item selector' + (active_tab == tab.id ? ' active' : '') + '">' + tab.title + '</div>');
                item.on('click', function(){
                    if(active_tab == tab.id) return;
                    active_tab = tab.id;
                    tabs_html.find('.active').removeClass('active');
                    item.addClass('active');
                    _this.load();
                });
                tabs_html.append(item);
            });
            scroll.append(tabs_html);
        };

        this.load = function () {
            var _this = this;
            Lampa.Loading.start();
            html.empty();

            var url = categories[active_tab];

            Lampa.Api.get(url, {}, function (json) {
                Lampa.Loading.stop();
                if (json && json.results && json.results.length) {
                    _this.build(json.results);
                } else {
                    _this.empty();
                }
            }, function () {
                Lampa.Loading.stop();
                _this.empty();
            });
        };

        this.build = function (results) {
            var _this = this;
            results.forEach(function (item) {
                var card = new Lampa.Card({
                    title: item.name || item.original_name,
                    img: Lampa.Api.img(item.poster_path),
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

        this.empty = function () {
            html.html('<div class="empty">В этой категории пока ничего нет</div>');
        };

        this.render = function () { return scroll.render(); };
        this.destroy = function () { network.clear(); scroll.destroy(); };
    }

    Lampa.Component.add('anime_catalog', AnimeComponent);

    function inject() {
        if ($('.menu [data-action="anime_catalog"]').length) return;
        var list = $('.menu .menu__list, .menu__list');
        if (list.length) {
            var item = $('<div class="menu__item selector" data-action="anime_catalog"><div class="menu__ico"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg></div><div class="menu__text">Аниме</div></div>');
            item.on('click', function () {
                Lampa.Activity.push({ title: 'Аниме Каталог', component: 'anime_catalog' });
            });
            var tv = list.find('[data-action="tv"]');
            if (tv.length) tv.after(item); else list.append(item);
        }
    }

    setInterval(inject, 1000);
})();
