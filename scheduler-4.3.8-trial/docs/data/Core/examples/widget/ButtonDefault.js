targetElement.innerHTML = `
<div id="first" class="widgetRow"></div>
<div id="second" class="widgetRow"></div>
`;

const onClick = () => Toast.show('Button clicked');

// WITH TEXT

// Text only
new Button({
    appendTo : 'first',
    text     : 'Text only',
    onClick
});

// Text + icon
new Button({
    appendTo : 'first',
    icon     : 'b-fa-cog',
    text     : 'Text & icon',
    onClick
});

// Text + badge
new Button({
    appendTo : 'first',
    badge    : 3,
    text     : 'Showing badge',
    color    : 'b-blue',
    onClick
});

// Disabled
new Button({
    appendTo : 'first',
    text     : 'Disabled',
    disabled : true
});

// ICONS ONLY

new Button({
    appendTo : 'second',
    icon     : 'b-fa-trash',
    color    : 'b-red',
    onClick
});

new Button({
    appendTo : 'second',
    icon     : 'b-fa-cog',
    color    : 'b-purple',
    onClick
});

new Button({
    appendTo : 'second',
    icon     : 'b-fa-download',
    color    : 'b-green',
    onClick
});

new Button({
    appendTo : 'second',
    icon     : 'b-fa-info',
    color    : 'b-blue',
    onClick
});
