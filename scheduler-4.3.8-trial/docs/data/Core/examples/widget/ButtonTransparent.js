targetElement.innerHTML = `
<div id="first-transparent" class="widgetRow"></div>
<div id="second-transparent" class="widgetRow"></div>
`;

const onClick = () => Toast.show('Button clicked');

// WITH TEXT

// Text only
new Button({
    appendTo : 'first-transparent',
    cls      : 'b-transparent',
    text     : 'Text only',
    onClick
});

// Text & icon
new Button({
    appendTo : 'first-transparent',
    cls      : 'b-transparent',
    icon     : 'b-fa-cog',
    text     : 'Text & icon',
    onClick
});

// Text + badge
new Button({
    appendTo : 'first-transparent',
    cls      : 'b-transparent',
    badge    : 3,
    text     : 'Showing badge',
    color    : 'b-blue',
    onClick
});

// Disabled
new Button({
    appendTo : 'first-transparent',
    cls      : 'b-transparent',
    text     : 'Disabled',
    disabled : true
});

// ICONS ONLY

// Red
new Button({
    appendTo : 'second-transparent',
    cls      : 'b-transparent',
    icon     : 'b-fa-trash',
    color    : 'b-red',
    onClick
});

// Purple
new Button({
    appendTo : 'second-transparent',
    cls      : 'b-transparent',
    icon     : 'b-fa-cog',
    color    : 'b-purple',
    onClick
});

// Green
new Button({
    appendTo : 'second-transparent',
    cls      : 'b-transparent',
    icon     : 'b-fa-download',
    color    : 'b-green',
    onClick
});

// Default color
new Button({
    appendTo : 'second-transparent',
    cls      : 'b-transparent',
    icon     : 'b-fa-info',
    onClick
});
