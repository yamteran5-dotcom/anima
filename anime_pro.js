(function () {
    'use strict';

    function AnimeKodikPlugin() {
        var network = new Lampa.Reguest();
        var scroll  = new Lampa.Scroll({mask: true, over: true});
        var html    = $('<div></div>');
        var body    = $('<div class="category-full"></div>');
        var active_tab = 0;

        var token = 'd6ee39461103e3002f5b5b93931903ee'; 

        var tabs = [
            {title: 'Популярное', params: '&types=anime-serial,anime&order=shikimori_rating'},
            {title: 'Онгоинги', params: '&types=anime-serial&status=ongoing'},
            {title: 'Новинки', params: '&types=anime-serial,anime&order=year'},
            {title: '18+', params: '&types=hentai,hentai-serial'}
        ];

        this.create = function () {
            var _this = this;
            var bar  = $('<div class="layer--tabs"><div class="layer--tabs_list"></div></div>');
            
            tabs.forEach(function (tab, i) {
                var t = $('<div class="layer--tabs_item selector">' + tab.title + '</div>');
                if (i === active_tab) t.addClass('active');
                t.on('hover:enter', function () {
                    if (active_tab === i) return;
                    active_tab = i;
                    bar.find('.layer--tabs_item').removeClass('active');
                    $(this).addClass('active');
                    _this.load();
                });
                bar.find('.layer--tabs_list').append(t);
            });

            html.append(bar).append(scroll.render());
            scroll.append(body);
            this.load();
            return this.render();
        };

        this.load = function () {
            var _this = this;
            Lampa.Loading.start();
            body.empty();

            // Чистый URL
            var api_url = 'https://kodikapi.com/list?token=' + token + tabs[active_tab].params + '&limit=50&with_material_data=true';
            
            // Используем метод Lampa для работы с сетью, пробуя разные варианты проксирования
            network.silent(Lampa.Utils.proxy(api_url), function (json) {
                Lampa.Loading.stop();
                if (json && json.results && json.results.length) {
                    _this.build(json.results);
                } else {
                    body.append('<div class="empty" style="padding:40px;text-align:center;">База пуста или ошибка API</div>');
                }
            }, function () {
                // Если первый прокси упал, пробуем напрямую (иногда на Tizen это работает лучше)
                network.silent(api_url, function(json) {
                    Lampa.Loading.stop();
                    if (json.results) _this.build(json.results);
                }, function() {
                    Lampa.Loading.stop();
                    body.append('<div class="empty" style="padding:40px;text-align:center;">Блокировка сети. Проверьте настройки прокси в Lampa.</div>');
                });
            });
        };

        this.build = function(items) {
            items.forEach(function (item) {
                var img = (item.material_data && item.material_data.poster_url) ? item.material_data.poster_url : (item.screenshots ? item.screenshots[0] : '');
                if (img && img.indexOf('http') === -1) img = 'https:' + img;

                var card = new Lampa.Card({
                    id: item.id,
                    title: item.russian_title || item.title,
                    img: img,
                    year: item.year || (item.material_data ? item.material_data.year : '')
                }, { card_source: 'kodik' });

                card.on('enter', function () {
                    Lampa.Activity.push({
                        component: 'full',
                        id: item.id,
                        method: 'anime',
                        card: card.object,
                        source: 'kodik'
                    });
                });

                card.create();
                body.append(card.render());
            });
            Lampa.Controller.enable('content');
        };

        this.render  = function () { return html; };
        this.destroy = function () { network.clear(); scroll.destroy(); html.remove(); };
    }

    function start() {
        Lampa.Component.add('anime_kodik', AnimeKodikPlugin);
        var item = $('<div class="menu__item selector" data-action="anime_kodik">' +
            '<div class="menu__ico"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="1" width="16" height="22" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg></div>' +
            '<div class="menu__text">Аниме</div>' +
        '</div>');
        item.on('hover:enter', function () {
            Lampa.Activity.push({title: 'Аниме', component: 'anime_kodik'});
        });
        $('.menu .menu__list').append(item);
    }

    if (window.appready) start();
    else Lampa.Listener.follow('app', function (e) { if (e.type == 'ready') start(); });
})();
