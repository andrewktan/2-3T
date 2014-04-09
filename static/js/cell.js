function Cell(pos, contents, parentPos) {
    this.pos = pos;
    this.value = null;
    this.contents = contents;
    this.parentPos = parentPos;
    this.jobj;

    if (parentPos != null) {
        this.jobj = $('.cell[pos=' + this.parentPos  + '] > .grid > .cell[pos=' + this.pos + ']'); // fix
    } else {
        this.jobj = $('.cell[pos=' + this.pos + '] > .grid > .cell[pos=0]').parent().parent(); // fix
    }
};
