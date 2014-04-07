{% macro draw_grid(width, height, content) %}
    <div class="grid" style="width:{{ width }}px; height:{{ height }}px;">
        {% for i in [0, 1, 2, 3, 4, 5, 6, 7, 8] %}
            <div class="cell" pos="{{ i }}" style="width:{{ width / 3 - 6 }}px; height:{{ height / 3 - 6 }}px;">
                {{ content|safe }}
            </div>
        {% endfor %}
    </div>
{% endmacro %}
