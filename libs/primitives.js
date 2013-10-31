var primitives = {


    triangle: function(radius, z){
        var x, y;
        var mesh = new Mesh();
        var hashes = [];

        for(var i =0; i<3;i++){
            x = Math.sin(LIBS.degToRad(360/3*i))*radius/2;
            y = Math.cos(LIBS.degToRad(360/3*i))*radius/2;
            mesh.coords.push(x,y,z);
            mesh.colors.push(Math.abs(x),Math.abs(y),Math.abs(z));
        }

        mesh.faces.push(0,1,2);
        //hashes.push('01','12','02');
        mesh.subdivideFaces();
        mesh.subdivideFaces();
        mesh.getNormals();
        mesh.prepare();
        return mesh;
    },

    plane: function(width, length,angle){

        var vertices = [
            -0.5,-0.5,-0.5,
            -0.5,0.5,0,
            0.5,-0.5,0,
            0.5,0.5,-0.5

        ];

        var colors = [];
        var faces = [];
        var normals = [];

        for(var i = 0; i<vertices.length; i++){
            colors.push(Math.abs(vertices[i]));
        }

        faces.push(0,1,2);
        faces.push(2,1,3);

        this.pushNormals(vertices, faces, normals);

        return {vertices: vertices, colors: colors, faces: faces, normals: normals};

    },

    goldenRectangles: function(a){
        var vertices = [];
        var coords = [];
        var colors = [];
        var faces = [];
        var normals = [];
        var b,phi;
        phi = (1 + Math.sqrt(5))/2;
        b = a/phi;


        coords.push(a/2*-1,b/2,0);
        colors.push(0,0,1);

        coords.push(a/2,b/2,0);
        colors.push(0,0,1);

        coords.push(a/2,b/2*-1,0);
        colors.push(1,0,0);

        coords.push(a/2*-1,b/2*-1,0);
        colors.push(1,0,0);

        faces.push(0,1,2,2,3,0);

        coords.push(0,a/2*-1,b/2);
        colors.push(0,1,0);

        coords.push(0, a/2,b/2);
        colors.push(0,1,0);

        coords.push(0, a/2,b/2*-1);
        colors.push(1,1,0);

        coords.push(0, a/2*-1,b/2*-1);
        colors.push(1,1,0);


        faces.push(4,5,6,6,7,4);

        coords.push(b/2, 0,a/2*-1);
        colors.push(0,1,0);

        coords.push(b/2, 0, a/2);
        colors.push(0,1,0);

        coords.push(b/2*-1, 0, a/2);
        colors.push(1,1,0);

        coords.push(b/2*-1, 0, a/2*-1);
        colors.push(1,1,0);


        faces.push(8,9,10,10,11,8);

        normals = this.getNormals(coords,faces);

        for(var j = 0; j<coords.length;j+=3){
            vertices.push(
                coords[j],coords[j+1],coords[j+2],
                colors[j],colors[j+1],colors[j+2],
                normals[j],normals[j+1],normals[j+2]
            );
        }

        return {vertices: vertices, faces: faces};
    },

    pyramid: function(radius){
        var mesh = new Mesh();
        mesh.coords.push(0,0,height/2);
        mesh.colors.push(0,0,1)
        var z = -1*height/2;
        for(var i = 0; i<4; i++){
            var angle = LIBS.degToRad(360/rate*i);
            var x = Math.sin(angle)*radius;
            var y =  Math.cos(angle)*radius;
            //vertice coords
            mesh.coords.push(x, y, z);
            //color for vertice
            mesh.colors.push(1, 0,0);
            mesh.faces.push(0, i+1,i<rate-1?i+2:1);
        }

        mesh.getNormals();

        return mesh;
    },

    cone: function(radius, height, rate){
        var mesh = new Mesh();
        mesh.coords.push(0,0,height/2);
        mesh.colors.push(0,0,1)
        var z = -1*height/2;
        for(var i = 0; i<rate; i++){
            var angle = LIBS.degToRad(360/rate*i);
            var x = Math.sin(angle)*radius;
            var y =  Math.cos(angle)*radius;
            //vertice coords
            mesh.coords.push(x, y, z);
            //color for vertice
            mesh.colors.push(1, 0,0);
            mesh.faces.push(0, i+1,i<rate-1?i+2:1);
        }

        //mesh.getNormals();
        for(var i = 0; i<mesh.coords.length;i++){
            var c = mesh.coords[i] + mesh.coords[i]/radius;
            mesh.normals.push(c)
        }
        mesh.prepare();
        return mesh;
    },

    cylinder: function(radius, height, rate){
        var mesh = new Mesh();

        for(var i = 0; i<rate; i++){
            var angle = LIBS.degToRad(360/rate*i);
            var color = LIBS.hsvToRgb(360/rate*i,100,100);
            var x = Math.sin(angle)*radius;
            var y =  Math.cos(angle)*radius;
            var z = height/2;
            //vertice coords
            mesh.coords.push(x, y, z);
            //colors.push(color[0], color[1],color[3]);
            mesh.colors.push(0, 0,1);

            mesh.coords.push(x, y, -1*z);
            //colors.push(color[0], color[1],color[3]);
            mesh.colors.push(1, 0,0);

            if(i<rate-1){
                mesh.faces.push(i*2, i*2+1,i*2+2);
                mesh.faces.push(i*2+2, i*2+1, i*2+3);
            }else{
                mesh.faces.push(i*2, i*2+1,0);
                mesh.faces.push(i*2+1, 0,1);
            }
        }

        for(var i = 0; i<mesh.coords.length;i++){
            var c = mesh.coords[i] + mesh.coords[i]/radius;
            mesh.normals.push(c)
        }

        //mesh.getNormals(mesh.coords, mesh.faces);
        mesh.prepare();
        return mesh;
    },

    cylinders: function(rFactor, hFactor, rateFactor, count){
        var model;
        var radius = 0.5;
        var height = 1;
        for(var i = 0; i<count; i++){
            radius += rFactor;
            height += hFactor;
            if(!model){
                model = this.cylinder(radius,height,rateFactor);
            }
            else{
                var facesLength = model.faces.length;
                var cylinder = this.cylinder(radius,height,rateFactor);
                for(var vi = 0; vi<cylinder.coords.length; vi++){
                    model.coords.push(cylinder.coords[vi]);
                }

                for(var fi = 0; fi<cylinder.faces.length; fi++){
                    model.faces.push(cylinder.faces[fi]+facesLength/3);
                }
            }
        }
        model.rate = rateFactor;
        model.count = count;
        return model;
    },

    icosahedron: function(radius, divisions){
        var sqr5 = 2.2361;
        var phi = (1.0 + sqr5) * 0.5;

        // Golden ratio - the ratio of edgelength to radius
        var ratio = Math.sqrt( 10.0 + (2.0 * sqr5)) / (4.0 * phi);
        var ia = (radius / ratio) * 0.5;
        var ib = (radius / ratio) / (2.0 * phi);
        var mesh = new Mesh();
        mesh.coords = [
            0,(ib),-1*(ia),
            (ib), (ia), 0,
            -1*(ib), (ia), 0,
            0, (ib), (ia),
            0,-1*(ib), (ia),
            -1*(ia), 0, (ib),
            0,-1*(ib),-1*(ia),
            ia, 0,-1*(ib),
            ia, 0, ib,
            -1*(ia), 0,-1*(ib),
            ib, -1*(ia),0,
            -1*(ib), -1*(ia),0
        ];

        mesh.faces = [
            0, 1, 2,
            3, 2, 1,
            3, 4, 5,
            3, 8, 4,
            0, 6, 7,
            0, 9, 6,
            4, 10, 11,
            6, 11, 10,
            2, 5, 9,
            11, 9, 5,
            1, 7, 8,
            10, 8, 7,
            3, 5, 2,
            3, 1, 8,
            0, 2, 9,
            0, 7, 1,
            6, 9, 11,
            6, 10, 7,
            4, 11, 5,
            4, 8, 10
        ];

        for(var i = 0; i<divisions;i++){
            mesh.subdivideFaces();
        }
        for(var i=0;i<mesh.coords.length;i+=3){
            mesh.colors.push(0.5,0,0.5);
        }
        //model.normals = this.getNormals(model.coords,model.faces);
        for(var i = 0; i<mesh.coords.length;i++){
            var c = mesh.coords[i]+mesh.coords[i]/radius;
            mesh.normals.push(c)
        }
        mesh.prepare();
        return mesh;

    },

    icosahedrons: function(rFactor, count){
        var model;
        var radius = 0.5;
        for(var i = 0; i<count; i++){
            radius += rFactor;
            if(!model){
                model = this.icosahedron(radius);
            }
            else{
                var facesLength = model.faces.length;
                var icosahedron = this.icosahedron(radius);

                for(var vi = 0; vi<icosahedron.vertices.length; vi++){
                    model.vertices.push(icosahedron.vertices[vi]);
                }

                for(var fi = 0; fi<icosahedron.faces.length; fi++){
                    model.faces.push(icosahedron.faces[fi]+facesLength/3);
                }
            }
        }
        model.count = count;
        return model;
    },

    spiral: function(rStart, rOffset,height,rate,count){
        var vertices = [];
        var coords = [];
        var colors = [];
        var faces = [];
        var normals = [];
        var radius = 0.1;
        var zOffset = rate*count/2*-0.001;

        var up =true;
        for(var i = 0; i<rate*count; i++){
            //lollypop ))
            var sRadius =  Math.cos(LIBS.degToRad(360/rate/count*i));

            zOffset=sRadius*5;
            radius += sRadius/1000;

            /*if(up){
                radius += rOffset;
                up = i<rate*count/2;
                if(!up)console.log(radius);
            }else{
                radius -= rOffset;
            }*/

            //console.log(Math.sin(angle));
            //var color = LIBS.hsvToRgb(360*i,100,100);
            var angle = LIBS.degToRad(360/rate*i);
            var x = Math.sin(angle)*radius;
            var y =  Math.cos(angle)*radius;
            var z = height/2;
            //vertice coords
            coords.push(x, y, z+zOffset);
            colors.push(Math.abs(x), Math.abs(y),Math.abs(z));

            coords.push(x, y, -1*z+zOffset);
            colors.push(Math.abs(x), Math.abs(y),Math.abs(z));

            if(i<rate*count-2){
                faces.push(i*2, i*2+1,i*2+2);
                faces.push(i*2+2, i*2+1, i*2+3);
            }else{

            }

        }

        normals = this.getNormals(coords, faces);

        for(var j = 0; j<coords.length;j+=3){
            vertices.push(
                coords[j],coords[j+1],coords[j+2],
                colors[j],colors[j+1],colors[j+2],
                normals[j],normals[j+1],normals[j+2]
            );
        }

        return {vertices: vertices, faces: faces};
    },

    spiralFlower: function(rStart, rOffset,height,rate,count){
            var vertices = [];
            var coords = [];
            var colors = [];
            var faces = [];
            var normals = [];
            var radius = 0.1;
            var zOffset = rate*count/2*-0.001;

            var up =true;
            for(var i = 0; i<rate*count; i++){
                //lollypop ))
                var sRadius =  Math.sin(LIBS.degToRad(rate/count*i));

                zOffset+=0.001;

                if(up){
                    radius += sRadius;
                    up = i<rate*count/2;
                }else{
                    radius -= sRadius;
                }

                //console.log(Math.sin(angle));
                //var color = LIBS.hsvToRgb(360*i,100,100);
                var angle = LIBS.degToRad(360/rate*i);
                var x = Math.sin(angle)*radius;
                var y =  Math.cos(angle)*radius;
                var z = height/2;
                //vertice coords
                coords.push(x, y, z+zOffset);
                colors.push(Math.abs(x), Math.abs(y),Math.abs(z));

                coords.push(x, y, -1*z+zOffset);
                colors.push(Math.abs(x), Math.abs(y),Math.abs(z));

                if(i<rate*count-2){
                    faces.push(i*2, i*2+1,i*2+2);
                    faces.push(i*2+2, i*2+1, i*2+3);
                }else{

                }

            }

            normals = this.getNormals(coords, faces);

            for(var j = 0; j<coords.length;j+=3){
                vertices.push(
                    coords[j],coords[j+1],coords[j+2],
                    colors[j],colors[j+1],colors[j+2],
                    normals[j],normals[j+1],normals[j+2]
                );
            }

        return {coords: coords, colors: colors, normals: normals, faces: faces};
        },

    sphere: function(radius, smoothness){

        var vertices = [];
        var coords = this.icosahedronCoords(radius);
        var colors = [];
        var faces = [];
        var normals = [];


    }
}
