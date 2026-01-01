(function () {
    'use strict';

    function AnimePro(object) {
        var network = new Lampa.Reguest();
        var scroll  = new Lampa.Scroll({mask:true, over:true});
        var html    = $('<div></div>');
        var body    = $('<div class="category-full"></div>');
        var info    = $('<div class="anime-pro-info" style="padding: 10px; opacity: 0.5; font-size: 0.8em;">Источник: Shikimori | Tizen Optimized</div>');
        var active  = 0;
        var page    = 1;

        // Настройка вкладок
        var tabs = [
            { title: 'Топ аниме', params: 'order=ranked&limit=40' },
            { title: 'Онгоинги', params: 'status=ongoing&order=popularity&limit=40' },
            { title: 'Сейчас смотрят', params: 'season=2024_2025&order=popularity&limit=40' },
            { title: 'Все аниме', params: 'order=popularity&limit=40' },
            { title: '18+', params: 'rating=rx,r_plus&censored=false&order=popularity&limit=40' }
        ];

        this.create = function () {
            var _this = this;
            this.activity.loader = true;

            // Рендерим табы
            var bar   = $('<div class="layer--tabs"></div>');
            var list  = $('<div class="layer--tabs_list"></div>');

            tabs.forEach(function (tab, i) {
                var item = $('<div class="layer--tabs_item selector '+(active == i ? 'active' : '')+'" data-index="'+i+'">'+tab.title+'</div>');
                item.on('hover:enter', function () {
                    if (active == i) return;
                    active = i;
                    page = 1;
                    $('.layer--tabs_item', list).removeClass('active');
                    $(this).addClass('active');
                    _this.load();
                });
                list.append(item);
            });

            bar.append(list);
            html.append(bar);
            html.append(info);
            html.append(scroll.render());
            scroll.append(body);

            this.load();

            return this.render();
        };

        this.load = function (append) {
            var _this = this;
            
            if(!append) {
                body.empty();
                scroll.reset();
                Lampa.Loading.start();
            }

            // Формируем запрос к Shikimori через прокси Lampa
            var query = tabs[active].params + '&page=' + page + '&censored=false'; 
            var url = Lampa.Utils.proxy('https://shikimori.one/api/animes?' + query);

            network.silent(url, function (json) {
                Lampa.Loading.stop();
                if(json && json.length){
                    _this.build(json);
                } else if(!append) {
                    body.append('<div class="empty" style="text-align:center; padding: 40px;">Ничего не найдено</div>');
                }
            }, function(){
                Lampa.Loading.stop();
                if(!append) body.append('<div class="empty" style="text-align:center; padding: 40px;">Ошибка загрузки API (Попробуйте прокси в настройках)</div>');
            });
        };

        this.build = function (data) {
            var _this = this;

            data.forEach(function(item){
                // Исправляем ссылки на картинки для Tizen
                var img_url = item.image ? item.image.original : '';
                if (img_url && img_url.indexOf('http') === -1) img_url = 'https://shikimori.one' + img_url;

                var card_data = {
                    id: item.id,
                    title: item.russian || item.name,
                    original_title: item.name,
                    img: img_url,
                    year: item.aired_on ? item.aired_on.split('-')[0] : '????',
                    score: item.score,
                    is_anime: true
                };

                var card = new Lampa.Card(card_data, {
                    card_source: 'shikimori',
                    object: card_data
                });

                card.on('enter', function(){
                    Lampa.Activity.push({
                        url: '',
                        component: 'full',
                        id: item.id,
                        method: 'anime',
                        card: card_data,
                        source: 'shikimori'
                    });
                });

                card.create();
                body.append(card.render());
            });

            // Кнопка "Еще"
            if(data.length >= 40) {
                var more = $('<div class="selector" style="width: 100%; padding: 30px; text-align: center;">Показать еще...</div>');
                more.on('hover:enter', function(){
                    page++;
                    $(this).remove();
                    _this.load(true);
                });
                body.append(more);
            }

            Lampa.Controller.enable('content');
        };

        this.render = function () {
            return html;
        };

        this.destroy = function () {
            network.clear();
            scroll.destroy();
            html.remove();
        };
    }

    function startPlugin() {
        window.plugin_anime_pro_ready = true;
        Lampa.Component.add('anime_pro', AnimePro);
        
        var menu_item = $('<div class="menu__item selector" data-action="anime_pro">' +
            '<div class="menu__ico"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg></div>' +
            '<div class="menu__text">Аниме Pro</div>' +
        '</div>');

        menu_item.on('hover:enter', function () {
            Lampa.Activity.push({
                title: 'Аниме Pro',
                component: 'anime_pro',
                page: 1
            });
        });

        $('.menu .menu__list').append(menu_item);
    }

    if (!window.plugin_anime_pro_ready) {
        if (window.appready) startPlugin();
        else Lampa.Listener.follow('app', function (e) {
            if (e.type == 'ready') startPlugin();
        });
    }
})();
