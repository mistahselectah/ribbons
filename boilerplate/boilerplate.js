

if ( !window.requestAnimationFrame ) {
    window.requestAnimationFrame = ( function() {
        return window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame;
    } )();
};

var main=function() {
    var CANVAS=document.getElementById("canvas");
    CANVAS.width=window.innerWidth;
    CANVAS.height=window.innerHeight;

    var AMORTIZATION=0.95;
    var drag=false;


    var old_x, old_y;

    var dX=0, dY=0;
    var mouseDown=function(e) {
        drag=true;
        old_x=e.pageX, old_y=e.pageY;
        e.preventDefault();
        return false;
    }

    var mouseUp=function(e){
        drag=false;
    }

    var mouseMove=function(e) {
        if (!drag) return false;
        dX=(e.pageX-old_x)*2*Math.PI/CANVAS.width,
            dY=(e.pageY-old_y)*2*Math.PI/CANVAS.height;
        THETA+=dX;
        PHI+=dY;
        old_x=e.pageX, old_y=e.pageY;
        e.preventDefault();
    }

    CANVAS.addEventListener("mousedown", mouseDown, false);
    CANVAS.addEventListener("mouseup", mouseUp, false);
    CANVAS.addEventListener("mouseout", mouseUp, false);
    CANVAS.addEventListener("mousemove", mouseMove, false);

    /*========================= GET WEBGL CONTEXT ========================= */
    try {
        var GL = CANVAS.getContext("experimental-webgl", {antialias: true});
    } catch (e) {
        alert("You are not webgl compatible :(") ;
        return false;
    } ;

    /*========================= SHADERS ========================= */

    function getShader(gl, id) {
        var shaderScript = document.getElementById(id);
        if (!shaderScript) {
            return null;
        }

        var str = "";
        var k = shaderScript.firstChild;
        while (k) {
            if (k.nodeType == 3) {
                str += k.textContent;
            }
            k = k.nextSibling;
        }

        var shader;
        if (shaderScript.type == "x-shader/x-fragment") {
            shader = gl.createShader(gl.FRAGMENT_SHADER);
        } else if (shaderScript.type == "x-shader/x-vertex") {
            shader = gl.createShader(gl.VERTEX_SHADER);
        } else {
            return null;
        }

        gl.shaderSource(shader, str);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            alert(gl.getShaderInfoLog(shader));
            return null;
        }

        return shader;
    }

    var shader_vertex=getShader(GL, "color-shader-vs");
    var shader_fragment=getShader( GL, "color-shader-fs");

    var SHADER_PROGRAM=GL.createProgram();
    GL.attachShader(SHADER_PROGRAM, shader_vertex);
    GL.attachShader(SHADER_PROGRAM, shader_fragment);

    GL.linkProgram(SHADER_PROGRAM);

    var _Pmatrix = GL.getUniformLocation(SHADER_PROGRAM, "Pmatrix");
    var _Vmatrix = GL.getUniformLocation(SHADER_PROGRAM, "Vmatrix");
    var _Mmatrix = GL.getUniformLocation(SHADER_PROGRAM, "Mmatrix");

    var _color = GL.getAttribLocation(SHADER_PROGRAM, "color");
    var _position = GL.getAttribLocation(SHADER_PROGRAM, "position");

    GL.enableVertexAttribArray(_color);
    GL.enableVertexAttribArray(_position);

    GL.useProgram(SHADER_PROGRAM);

    //var model = primitives.triangle(2,0);
    var model = primitives.spiral(1,0.001,0.1,360,100);
    for (var i = 0; i < 2; i++){
        //primitives.subdivideFaces(model.coords, model.colors, model.faces,[], true);
    }
    console.log(model);

    //model.vertices = primitives.prepareVertices(model);

    var CUBE_VERTEX= GL.createBuffer ();
    GL.bindBuffer(GL.ARRAY_BUFFER, CUBE_VERTEX);
    GL.bufferData(GL.ARRAY_BUFFER,
        new Float32Array(model.vertices),
        GL.STATIC_DRAW);


    var CUBE_FACES= GL.createBuffer ();
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, CUBE_FACES);
    GL.bufferData(GL.ELEMENT_ARRAY_BUFFER,
        new Uint16Array(model.faces),
        GL.STATIC_DRAW);

    /*========================= MATRIX ========================= */

    var PROJMATRIX=LIBS.get_projection(40, CANVAS.width/CANVAS.height, 1, 100);
    var MOVEMATRIX=LIBS.get_I4();
    var VIEWMATRIX=LIBS.get_I4();

    var THETA=0,
           PHI=0;

    LIBS.translateZ(VIEWMATRIX, -30);

    /*========================= DRAWING ========================= */
    GL.enable(GL.DEPTH_TEST);
    GL.depthFunc(GL.LESS);
    GL.clearColor(0.0, 0.0, 0.0, 0.0);
    GL.clearDepth(1.0);

    var time_old=0;
    var animate=function(time) {
        var dt=time-time_old;
        if (!drag) {
            dX*=AMORTIZATION, dY*=AMORTIZATION;
            THETA+=dX, PHI+=dY;
        }

        LIBS.set_I4(MOVEMATRIX);
        LIBS.rotateY(MOVEMATRIX, THETA);
        LIBS.rotateX(MOVEMATRIX, PHI);
        time_old=time;

        GL.viewport(0.0, 0.0, CANVAS.width, CANVAS.height);
        GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);
        GL.uniformMatrix4fv(_Pmatrix, false, PROJMATRIX);
        GL.uniformMatrix4fv(_Vmatrix, false, VIEWMATRIX);
        GL.uniformMatrix4fv(_Mmatrix, false, MOVEMATRIX);
        GL.vertexAttribPointer(_position, 3, GL.FLOAT, false,4*9,0) ;
        GL.vertexAttribPointer(_color, 3, GL.FLOAT, false,4*9,3*4) ;
        GL.bindBuffer(GL.ARRAY_BUFFER, CUBE_VERTEX);
        GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, CUBE_FACES);
        GL.drawElements(GL.TRIANGLES, model.faces.length, GL.UNSIGNED_SHORT, 0);
        //GL.drawArrays(GL.POINTS,0, model.vertices.length/9);

        GL.flush();

        window.requestAnimationFrame(animate);
    }
    animate(0);
}