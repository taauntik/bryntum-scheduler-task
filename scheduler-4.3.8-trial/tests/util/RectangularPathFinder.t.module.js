import { RectangularPathFinder } from '../../build/scheduler.module.js?456730';

StartTest(t => {
    function getBoxConnectionPoint(box, side, shift, arrowSize) {
        const point = {};

        switch (side) {
            case 'left':
                point.x = box.start - arrowSize;
                point.y = (box.top + box.bottom) / 2 + shift;
                break;
            case 'right':
                point.x = box.end + arrowSize;
                point.y = (box.top + box.bottom) / 2 + shift;
                break;
            case 'top':
                point.x = (box.start + box.end) / 2 + shift;
                point.y = box.top - arrowSize;
                break;
            case 'bottom':
                point.x = (box.start + box.end) / 2 + shift;
                point.y = box.bottom + arrowSize;
                break;
        }

        return point;
    }

    function checkLineData(t, pathFinder, lineDef, lineSegmentsData, expectSegments) {
        let startConnPoint,
            endConnPoint,
            firstSegment,
            lastSegment,
            isLineContinous,
            i;

        t.ok(lineSegmentsData, 'Path found');

        if (lineSegmentsData) {
            //lineDef = Object.assign({}, lineDef, pathFinder.config);
            lineDef = Object.assign({}, pathFinder.config, lineDef);

            startConnPoint = getBoxConnectionPoint(lineDef.startBox, lineDef.startSide, lineDef.startShift, lineDef.startArrowSize);
            endConnPoint = getBoxConnectionPoint(lineDef.endBox, lineDef.endSide, lineDef.endShift, lineDef.endArrowSize);

            firstSegment = lineSegmentsData[0];
            lastSegment = lineSegmentsData[lineSegmentsData.length - 1];

            // checking line length
            t.is(lineSegmentsData.length, expectSegments, 'Line contain expected amount of segments');

            // checking line start
            t.ok(
                startConnPoint.x === firstSegment.x1 && startConnPoint.y === firstSegment.y1,
                'Line starts at correct start point'
            );

            // checking line end
            t.ok(
                endConnPoint.x === lastSegment.x2 && endConnPoint.y === lastSegment.y2,
                'Line ends at correct end point'
            );

            // checking line connectivity
            for (i = 1, isLineContinous = true; isLineContinous && i < lineSegmentsData.length; ++i) {
                isLineContinous =
                    (lineSegmentsData[i - 1].x2 === lineSegmentsData[i].x1) &&
                    (lineSegmentsData[i - 1].y2 === lineSegmentsData[i].y1);
            }

            t.ok(isLineContinous, 'Line is continous, i.e. it has no gaps');
        }
    }

    // eslint-disable-next-line no-unused-vars
    function drawConnection(pathFinderConfig, lineDef) {
        const body = document.body;

        const div1 = document.createElement('div');
        div1.style.position = 'absolute';
        //border   : '1px solid black',
        div1.style.border = '0px none';
        div1.style.backgroundColor = 'orange';
        div1.style.top = lineDef.startBox.top + 'px';
        div1.style.left = lineDef.startBox.start + 'px';
        div1.style.width = (lineDef.startBox.end - lineDef.startBox.start) + 'px';
        div1.style.height = (lineDef.startBox.bottom - lineDef.startBox.top) + 'px';
        body.appendChild(div1);

        const div2 = document.createElement('div');
        div2.style.position = 'absolute';
        //border   = '1px solid black',
        div2.style.border = '0px none';
        div2.style.backgroundColor = 'orange';
        div2.style.top = lineDef.endBox.top + 'px';
        div2.style.left = lineDef.endBox.start + 'px';
        div2.style.width = (lineDef.endBox.end - lineDef.endBox.start) + 'px';
        div2.style.height = (lineDef.endBox.bottom - lineDef.endBox.top) + 'px';
        body.appendChild(div2);

        lineDef.otherBoxes && lineDef.otherBoxes.forEach(box => {
            const otherDiv = document.createElement('div');
            otherDiv.style.position = 'absolute';
            //border   = '1px solid black';
            otherDiv.style.border = '0px none';
            otherDiv.style.backgroundColor = 'red';
            otherDiv.style.top = box.top + 'px';
            otherDiv.style.left = box.start + 'px';
            otherDiv.style.width = (box.end - box.start) + 'px';
            otherDiv.style.height = (box.bottom - box.top) + 'px';
            body.appendChild(otherDiv);
        });

        const lineContEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        lineContEl.style.position = 'absolute';
        lineContEl.style.overflow = 'visible';
        body.appendChild(lineContEl);

        const
            pathFinder = new RectangularPathFinder(pathFinderConfig),
            path       = pathFinder.findPath(lineDef);

        lineContEl.innerHTML = path.map(line => `<line style="stroke:black;stroke-width:1px;" x1="${line.x1}" x2="${line.x2}" y1="${line.y1}" y2="${line.y2}"></line>`);
    }

    t.describe('Rectangular path finder takes a line specification and divides it into a list of segments consisting a line', function(t) {
        t.it("It should properly segment a line with minimal amount of segments possible regardles of line's boxes connection sides", function(t) {
            //
            //        +---------+  1 segment   +----------+
            //     +--|         |------------->|-shift    |<-+
            //     |  +---------+              |          |  |
            //     |               5 segments  +----------+  |
            //     +-----------------------------------------+
            let lineSegmentsData;

            const
                pathFinder = new RectangularPathFinder({
                    verticalMargin : 10
                }),
                lineDef = {
                    startBox : { top : 100, start : 100, bottom : 250, end : 250 },
                    endBox   : { top : 100, start : 400, bottom : 300, end : 550 },
                    endShift : -25
                },

                // start side - end side - segments amount
                testPlan = {
                    left : {
                        left   : 5,
                        right  : 5,
                        top    : 4,
                        bottom : 4
                    },
                    right : {
                        left   : 1,
                        right  : 5,
                        top    : 4,
                        bottom : 4
                    },
                    top : {
                        left   : 4,
                        right  : 4,
                        top    : 3,
                        bottom : 5
                    },
                    bottom : {
                        left   : 4,
                        right  : 4,
                        top    : 5,
                        bottom : 3
                    }
                };

            Object.entries(testPlan).forEach(entry => {
                const [startSide, endSideTestPlan] = entry;
                Object.entries(endSideTestPlan).forEach(entry2 =>  {
                    const [endSide, expectedSegments] = entry2;
                    lineDef.startSide = startSide;
                    lineDef.endSide = endSide;
                    lineSegmentsData = pathFinder.findPath(lineDef);
                    t.diag('From ' + startSide + ' to ' + endSide + ' expect segments ' + expectedSegments);
                    checkLineData(t, pathFinder, lineDef, lineSegmentsData, expectedSegments);
                });
            });
        });

        t.it('Should support advanced pathfinding', function(t) {
            //                    +---+--------------------+
            //     +-------+      |***|********************|
            //  +--+       |      |***+---------------+----+
            //  |  +-------+      |***|   +------+    |****|
            //  |                 |***| +>|      |    |****|
            //  |                 |***| | +------+    +----+
            //  |                 |***| +-+------+------------+
            //  |                 |***+--------------------+  |
            //  |                 |***|********************|  |
            //  |                 +---+--------------------+  |
            //  +---------------------------------------------+
            const
                pathFinder = new RectangularPathFinder({
                    verticalMargin : 10
                }),
                lineDef = {
                    startBox   : { top : 50, start : 50, bottom : 100, end : 100 },
                    endBox     : { top : 125, start : 300, bottom : 225, end : 350 },
                    otherBoxes : [
                        { top : 50, start : 200, bottom : 300, end : 250 },
                        { top : 50, start : 250, bottom : 100, end : 500 },
                        { top : 250, start : 250, bottom : 300, end : 500 },
                        { top : 100, start : 450, bottom : 225, end : 500 }
                    ]
                };

            //drawConnection(pathFinder.getConfig(), lineDef);

            checkLineData(t, pathFinder, lineDef, pathFinder.findPath(lineDef), 7);
        });

        t.it('Should properly report when path could not be found', function(t) {
            //                    +---+--------------------+
            //     +-------+      |***|********************|
            //  +--+       |      |***+---------------+----+
            //  |  +-------+      |***|   +------+    |****|
            //  |                 |***|   |      |    |****|
            //  |                 |***|   +------+    |****|
            //  |                 |***|               |****|  X
            //  |                 |***+---------------+----+  |
            //  |                 |***|********************|  |
            //  |                 +---+--------------------+  |
            //  +---------------------------------------------+
            // let pathFinder = new RectangularPathFinder({
            //     verticalMargin : 10
            // });
            //
            // let lineDef = {
            //     startBox   : { top : 50, start : 50, bottom : 100, end : 100 },
            //     endBox     : { top : 125, start : 300, bottom : 225, end : 350 },
            //     otherBoxes : [
            //         { top : 50, start : 200, bottom : 300, end : 250 },
            //         { top : 50, start : 250, bottom : 100, end : 500 },
            //         { top : 250, start : 250, bottom : 300, end : 500 },
            //         { top : 100, start : 450, bottom : 250, end : 500 }
            //     ]
            // };

            //TODO: This test does nothing?

            //drawConnection(pathFinder.getConfig(), lineDef);
        });
    });

    t.describe('Box calculation API', t => {
        const
            box   = { start : 30, end : 40, top : 30, bottom : 40 },
            box00 = { start : 10, end : 20, top : 10, bottom : 20 }, // 0
            box01 = { start : 10, end : 20, top : 10, bottom : 30 }, // 1
            box02 = { start : 10, end : 20, top : 10, bottom : 35 }, // 1
            box03 = { start : 10, end : 20, top : 10, bottom : 40 }, // 1
            box04 = { start : 10, end : 20, top : 10, bottom : 50 }, // -2
            box05 = { start : 10, end : 20, top : 30, bottom : 50 }, // 3
            box06 = { start : 10, end : 20, top : 35, bottom : 50 }, // 3
            box07 = { start : 10, end : 20, top : 40, bottom : 50 }, // 3
            box08 = { start : 10, end : 20, top : 45, bottom : 50 }, // 4
            box09 = { start : 10, end : 20, top : 30, bottom : 35 }, // 2
            box10 = { start : 10, end : 20, top : 32, bottom : 35 }, // 2
            box11 = { start : 10, end : 20, top : 35, bottom : 40 }, // 2
            boxes = [box00, box01, box02, box03, box04, box05, box06, box07, box08, box09, box10, box11];

        t.describe('Vertical direction', t => {
            t.is(RectangularPathFinder.calculateRelativePosition(box00, box, true), 0);
            t.is(RectangularPathFinder.calculateRelativePosition(box01, box, true), 1);
            t.is(RectangularPathFinder.calculateRelativePosition(box02, box, true), 1);
            t.is(RectangularPathFinder.calculateRelativePosition(box03, box, true), 1);
            t.is(RectangularPathFinder.calculateRelativePosition(box04, box, true), -2);
            t.is(RectangularPathFinder.calculateRelativePosition(box05, box, true), 3);
            t.is(RectangularPathFinder.calculateRelativePosition(box06, box, true), 3);
            t.is(RectangularPathFinder.calculateRelativePosition(box07, box, true), 3);
            t.is(RectangularPathFinder.calculateRelativePosition(box08, box, true), 4);
            t.is(RectangularPathFinder.calculateRelativePosition(box09, box, true), 2);
            t.is(RectangularPathFinder.calculateRelativePosition(box10, box, true), 2);
            t.is(RectangularPathFinder.calculateRelativePosition(box11, box, true), 2);

            t.is(RectangularPathFinder.calculateRelativePosition(box11, box), 0);
        });

        t.describe('Horizontal direction', t => {
            // Flip start/end with top/bottom
            boxes.forEach(obj => {
                let tmp = obj.start;
                obj.start = obj.top;
                obj.top = tmp;

                tmp = obj.end;
                obj.end = obj.bottom;
                obj.bottom = tmp;
            });

            t.is(RectangularPathFinder.calculateRelativePosition(box00, box), 0);
            t.is(RectangularPathFinder.calculateRelativePosition(box01, box), 1);
            t.is(RectangularPathFinder.calculateRelativePosition(box02, box), 1);
            t.is(RectangularPathFinder.calculateRelativePosition(box03, box), 1);
            t.is(RectangularPathFinder.calculateRelativePosition(box04, box), -2);
            t.is(RectangularPathFinder.calculateRelativePosition(box05, box), 3);
            t.is(RectangularPathFinder.calculateRelativePosition(box06, box), 3);
            t.is(RectangularPathFinder.calculateRelativePosition(box07, box), 3);
            t.is(RectangularPathFinder.calculateRelativePosition(box08, box), 4);
            t.is(RectangularPathFinder.calculateRelativePosition(box09, box), 2);
            t.is(RectangularPathFinder.calculateRelativePosition(box10, box), 2);
            t.is(RectangularPathFinder.calculateRelativePosition(box11, box), 2);

            t.is(RectangularPathFinder.calculateRelativePosition(box11, box, true), 0);
        });

        t.describe('Diagonal', t => {
            boxes.forEach(box => {
                if (box.end > box.bottom) {
                    box.top = box.start;
                    box.bottom = box.end;
                }
                else {
                    box.start = box.top;
                    box.end = box.bottom;
                }
            });

            t.is(RectangularPathFinder.calculateRelativePosition(box00, box), 0);
            t.is(RectangularPathFinder.calculateRelativePosition(box01, box), 1);
            t.is(RectangularPathFinder.calculateRelativePosition(box02, box), 1);
            t.is(RectangularPathFinder.calculateRelativePosition(box03, box), 1);
            t.is(RectangularPathFinder.calculateRelativePosition(box04, box), -2);
            t.is(RectangularPathFinder.calculateRelativePosition(box05, box), 3);
            t.is(RectangularPathFinder.calculateRelativePosition(box06, box), 3);
            t.is(RectangularPathFinder.calculateRelativePosition(box07, box), 3);
            t.is(RectangularPathFinder.calculateRelativePosition(box08, box), 4);
            t.is(RectangularPathFinder.calculateRelativePosition(box09, box), 2);
            t.is(RectangularPathFinder.calculateRelativePosition(box10, box), 2);
            t.is(RectangularPathFinder.calculateRelativePosition(box11, box), 2);

            t.is(RectangularPathFinder.calculateRelativePosition(box00, box, true), 0);
            t.is(RectangularPathFinder.calculateRelativePosition(box01, box, true), 1);
            t.is(RectangularPathFinder.calculateRelativePosition(box02, box, true), 1);
            t.is(RectangularPathFinder.calculateRelativePosition(box03, box, true), 1);
            t.is(RectangularPathFinder.calculateRelativePosition(box04, box, true), -2);
            t.is(RectangularPathFinder.calculateRelativePosition(box05, box, true), 3);
            t.is(RectangularPathFinder.calculateRelativePosition(box06, box, true), 3);
            t.is(RectangularPathFinder.calculateRelativePosition(box07, box, true), 3);
            t.is(RectangularPathFinder.calculateRelativePosition(box08, box, true), 4);
            t.is(RectangularPathFinder.calculateRelativePosition(box09, box, true), 2);
            t.is(RectangularPathFinder.calculateRelativePosition(box10, box, true), 2);
            t.is(RectangularPathFinder.calculateRelativePosition(box11, box, true), 2);
        });
    });

    t.describe('Path finder calculations', t => {
        function buildPath(points) {
            const result = [];

            for (let i = 0, l = points.length - 1; i < l; i++) {
                const p1 = points[i],
                    p2 = points[i + 1];

                result.push({
                    x1 : p1.x,
                    x2 : p2.x,
                    y1 : p1.y,
                    y2 : p2.y
                });
            }

            return result;
        }

        t.it('Should take other horizontal margin into account', t => {
            const lineDef = {
                startBox   : { top : 100, bottom : 200, start : 100, end : 200 },
                endBox     : { top : 400, bottom : 500, start : 100, end : 200 },
                otherBoxes : [
                    { top : 250, bottom : 350, start : 100, end : 200 },
                    // Config above allows two paths of identical price, so path may differ in browsers.
                    // This box is only required to eliminate one of the paths
                    { top : 200, bottom : 250, start : 100, end : 110 }
                ],
                startSide : 'bottom',
                endSide   : 'top'
            };

            const pathFinder = new RectangularPathFinder({
                startArrowMargin      : 10,
                startArrowSize        : 0,
                endArrowMargin        : 10,
                endArrowSize          : 0,
                horizontalMargin      : 0,
                verticalMargin        : 0,
                otherHorizontalMargin : 10,
                otherVerticalMargin   : 10
            });

            const path = pathFinder.findPath(lineDef);

            t.is(path.length, 5, '5 lines in path');

            drawConnection(pathFinder.config, lineDef);

            t.isDeeply(path, buildPath([
                { x : 150, y : 200 },
                { x : 150, y : 210 },
                { x : 210, y : 210 },
                { x : 210, y : 360 },
                { x : 150, y : 360 },
                { x : 150, y : 400 }
            ]));
        });

        // https://github.com/bryntum/support/issues/2811
        t.it('Margins should not move start box after end box', t => {
            // When boxes are too small and positioned too close to each other like this:
            //
            //  +---+
            //  |   |   +---+
            //  |   |---|   |
            //  |   |   +---+
            //  +---+
            //
            // margins should not move one box into another and draw path like this:
            //
            //      +---+
            //    +-|-+ |
            // +--| | | |--+
            // |  +-|-+ |  |
            // |    +---+  |
            // +-----------+
            //
            // Instead it should returns false for path could not be found
            const lineDef = {
                startBox  : { top : 10, bottom : 20, start : 10, end : 15 },
                endBox    : { top : 10, bottom : 20, start : 20, end : 25 },
                startSide : 'right',
                endSide   : 'left'
            };

            const pathFinder = new RectangularPathFinder({
                // Pick start arrow margin so it is greater than start width + 2 * horizontal margin
                startArrowMargin      : 17,
                startArrowSize        : 0,
                endArrowMargin        : 17,
                endArrowSize          : 0,
                horizontalMargin      : 5,
                verticalMargin        : 0,
                otherHorizontalMargin : 10,
                otherVerticalMargin   : 10
            });

            const path = pathFinder.findPath(lineDef);

            t.notOk(path, 'Path should not be found');
        });
    });
});
