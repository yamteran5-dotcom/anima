(function () {
    'use strict';

    // Регистрируем пустой компонент, чтобы Lampa не ругалась на Activity
    Lampa.Component.add('anime_search_engine', function(){
        this.create = function(){ return $('<div></div>'); };
        this.render = function(){ return ''; };
        this.destroy = function(){};
    });

    function inject() {
        if ($('.menu [data-action="anime_search"]').length) return;

        var list = $('.menu .menu__list, .menu__list');
        if (list.length) {
            var item = $(`
                <div class="menu__item selector" data-action="anime_search">
                    <div class="menu__ico">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
                        </svg>
                    </div>
                    <div class="menu__text">Аниме</div>
                </div>
            `);

            item.on('click', function () {
                // Вместо загрузки своего каталога, вызываем системный поиск
                // Это заставляет Lampac/BWA сделать запрос через свои рабочие шлюзы
                Lampa.Search.open({
                    query: 'Аниме',
                    component: 'tv' // Ищем в категории сериалов
                });
                
                // Закрываем меню (актуально для Tizen/Web)
                if(Lampa.Menu.hide) Lampa.Menu.hide();
            });

            var tv = list.find('[data-action="tv"]');
            if (tv.length) tv.after(item);
            else list.append(item);
        }
    }

    // Агрессивный мониторинг меню (300мс)
    setInterval(inject, 300);

})();
