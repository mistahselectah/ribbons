var primitives = {

    length: function(vector){
        return Math.sqrt(Math.pow(vector[0],2)+Math.pow(vector[1],2)+Math.pow(vector[2],2));
    },

    normalize: function(normals){
        var x, y, z, a;
        for(var i = 0; i<normals.length/3;i+=3){
            x = normals[i];
            y = normals[i+1];
            z = normals[i+2];
            a = Math.sqrt(Math.pow(x,2)+Math.pow(y,2)+Math.pow(z,2));
            normals.splice(i,3,a*x/Math.abs(a),a*y/Math.abs(a),a*z/Math.abs(a));
        }
    },

    prepareVertices: function(model){
        var vertices = [];
        for(var j = 0; j<model.coords.length;j+=3){
            vertices.push(
                model.coords[j],model.coords[j+1],model.coords[j+2],
                model.colors[j],model.colors[j+1],model.colors[j+2],
                model.normals[j],model.normals[j+1],model.normals[j+2]
            );
        }
        return vertices;
    },

    hash: function(i0,i1){
        return i0.toString().concat(i1);
        //return str.split("").reduce(function(a,b){a=((a<<5)-a)+b.charCodeAt(0);return a&a},0);
    },

    getNormal: function(a,b,c){
        var edge1 = this.subVector(a,b);
        var edge2 = this.subVector(a,c);
        return this.crossProduct(edge1,edge2);
    },

    interpolateVector: function(a, b){
        var result = [];
        result[0] = a[0] + b[0];
        result[1] = a[1] + b[1];
        result[2] = a[2] + b[2];
        return result;
    },

    subVector: function(a,b){
        var result = [];
        result.push(b[0]-a[0], b[1]-a[1], b[2]-a[2]);
        return result;
    },

    crossProduct: function(a, b){
        var result = [];
        result[0] = a[1] * b[2] - a[2] * b[1];
        result[1] = a[2] * b[0] - a[0] * b[2];
        result[2] = a[0] * b[1] - a[1] * b[0];
        return result;
    },

    getCoords: function(vertArray, index){
        return [vertArray[3*index],vertArray[3*index+1],vertArray[3*index+2]];
    },

    getNormals: function(coords, faces){

        var normals = [];
        var a, b, c, normal;
        for(var j = 0; j<faces.length; j+=3){

            a = this.getCoords(coords,faces[j]);
            b = this.getCoords(coords, faces[j+1]);
            c = this.getCoords(coords, faces[j+2]);

            normal = this.getNormal(a,b,c);
            //this.normalize(normal);
            normals.push(normal[0],normal[1],normal[2]);
            normals.push(normal[0],normal[1],normal[2]);
            normals.push(normal[0],normal[1],normal[2]);
        }

        /*for(var i = 0; i<vertices.length; i++){
            normals.push(0);
        }
        var a, b, c, na, nb, nc, normal;
        for(var j = 0; j<faces.length; j+=3){

            a = this.getCoords(vertices, j);
            b = this.getCoords(vertices, j+1);
            c = this.getCoords(vertices, j+2);

            normal = this.getNormal(a,b,c);

            na = this.getCoords(normals, j);
            nb = this.getCoords(normals, j+1);
            nc = this.getCoords(normals, j+2);

            var addResult = this.interpolateVector(na,normal);
            normals[faces[j]] = addResult[0];
            normals[faces[j]+1] = addResult[1];
            normals[faces[j]+2] = addResult[2];

            addResult = this.interpolateVector(nb,normal);
            normals[faces[j+1]] = addResult[0];
            normals[faces[j+1]+1] = addResult[1];
            normals[faces[j+1]+2] = addResult[2];

            addResult = this.interpolateVector(nc,normal);
            normals[faces[j+2]] = addResult[0];
            normals[faces[j+2]+1] = addResult[1];
            normals[faces[j+2   ]+2] = addResult[2];

        }*/

        return normals;
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

    getMidPointIndex: function(hashes,coords,i0,i1){

        var hash = this.hash(Math.min(i0,i1),Math.max(i0,i1));

        var index = hashes.indexOf(hash);

        for(var i = 0;i<hashes.count;i++){
            if(hashes[i].hash == hash){
                return hashes[i].index;
            }
        }

        var a = this.getCoords(coords,i0);
        var b = this.getCoords(coords,i1);

        var midpoint = [
            (a[0]+b[0])/2,
            (a[1]+b[1])/2,
            (a[2]+b[2])/2
        ];

        var radius  = this.length(a);
        var lengthM = this.length(midpoint);
        midpoint[0] *= radius/lengthM;
        midpoint[1] *= radius/lengthM;
        midpoint[2] *= radius/lengthM;

        index = coords.length/3;
        coords.push(midpoint[0],midpoint[1],midpoint[2]);
        hashes.push({hash: hash, index: index});

        return index;
    },

    subdivideIcosahedra: function(model){
        var hashes=[];
        var facesLength = model.faces.length;
        var newFaces = [];

        for(var i = 0;i<facesLength-2;i+=3){
            var a, b, c, r, g, b, m01, m12, m02;

            var i0 = model.faces[i];
            var i1 = model.faces[i + 1];
            var i2 = model.faces[i + 2];


            m01  = this.getMidPointIndex(hashes, model.coords,i0,i1);
            m12  = this.getMidPointIndex(hashes, model.coords,i1,i2);
            m02  = this.getMidPointIndex(hashes, model.coords,i0,i2);

            r = Math.abs(1);
            g = Math.abs(0);
            b = Math.abs(1);

            model.colors.push(r,g, b);
            model.colors.push(r,g, b);
            model.colors.push(r, g, b);

            newFaces.push(
                i0,m01,m02,
                i1,m12,m01,
                i2,m02,m12,
                m02,m01,m12
            );
        }
        var normals = this.getNormals(model.coords, model.faces);
        return {coords: model.coords, colors: model.colors, faces: newFaces, normals: normals};
    },

    subdivideFaces: function(model){
        var hashes=[];
        var facesLength = model.faces.length;
        var newFaces = [];

        for(var i = 0;i<facesLength-2;i+=3){
            var a, b, c, r, g, b, m01, m12, m02;

            var i0 = model.faces[i];
            var i1 = model.faces[i + 1];
            var i2 = model.faces[i + 2];


            m01  = this.getMidPointIndex(hashes, model.coords,i0,i1);
            m12  = this.getMidPointIndex(hashes, model.coords,i1,i2);
            m02  = this.getMidPointIndex(hashes, model.coords,i0,i2);

            r = Math.abs(1);
            g = Math.abs(0);
            b = Math.abs(1);

            model.colors.push(r,g, b);
            model.colors.push(r,g, b);
            model.colors.push(r, g, b);

            newFaces.push(
                i0,m01,m02,
                i1,m12,m01,
                i2,m02,m12,
                m02,m01,m12
            );
        }
        var normals = this.getNormals(model.coords, model.faces);
        return {coords: model.coords, colors: model.colors, faces: newFaces, normals: normals};
    },

    triangle: function(radius, z){
        var x, y;
        var vertices = [];
        var coords = [];
        var colors = [];
        var faces = [];
        var normals = [];
        var hashes = [];

        for(var i =0; i<3;i++){
            x = Math.sin(LIBS.degToRad(360/3*i))*radius/2;
            y = Math.cos(LIBS.degToRad(360/3*i))*radius/2;
            coords.push(x,y,z);
            colors.push(Math.abs(x),Math.abs(y),Math.abs(z));
        }

        faces.push(0,1,2);
        //hashes.push('01','12','02');

        normals = this.getNormals(coords, faces);

        return {coords: coords, colors: colors, normals: normals, faces: faces};
    },

    cone: function(radius, height, rate){
        var vertices = [];
        var coords = [];
        var colors = [];
        var faces = [];
        var normals = [];
        coords.push(0,0,height/2);
        colors.push(0,0,1)
        var z = -1*height/2;
        for(var i = 0; i<rate; i++){
            var angle = LIBS.degToRad(360/rate*i);
            var x = Math.sin(angle)*radius;
            var y =  Math.cos(angle)*radius;
            //vertice coords
            coords.push(x, y, z);
            //color for vertice
            colors.push(1, 0,0);
            faces.push(0, i+1,i<rate-1?i+2:1);
        }

        normals = this.getNormals(coords, faces);

        return {vertices: [], coords: coords, colors:colors, normals: normals, faces: faces};
    },

    cylinder: function(radius, height, rate){
        var vertices = [];
        var coords = [];
        var colors = [];
        var faces = [];
        var normals = [];

        for(var i = 0; i<rate; i++){
            var angle = LIBS.degToRad(360/rate*i);
            var color = LIBS.hsvToRgb(360/rate*i,100,100);
            var x = Math.sin(angle)*radius;
            var y =  Math.cos(angle)*radius;
            var z = height/2;
            //vertice coords
            coords.push(x, y, z);
            //colors.push(color[0], color[1],color[3]);
            colors.push(0, 0,1);

            coords.push(x, y, -1*z);
            //colors.push(color[0], color[1],color[3]);
            colors.push(1, 0,0);

            if(i<rate-1){
                faces.push(i*2, i*2+1,i*2+2);
                faces.push(i*2+2, i*2+1, i*2+3);
            }else{
                faces.push(i*2, i*2+1,0);
                faces.push(i*2+1, 0,1);
            }
        }

        normals = this.getNormals(coords, faces);

        return {vertices: [], coords: coords, colors:colors, normals: normals, faces: faces};
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

    icosahedron: function(radius, level){
        var sqr5 = 2.2361;
        var phi = (1.0 + sqr5) * 0.5;

        // Golden ratio - the ratio of edgelength to radius
        var ratio = Math.sqrt( 10.0 + (2.0 * sqr5)) / (4.0 * phi);
        var ia = (radius / ratio) * 0.5;
        var ib = (radius / ratio) / (2.0 * phi);

        var coords = [
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

        var colors = [];
        for(var i=0;i<coords.length;i+=3){

            colors.push(0.5,0.5,0.5);
            colors.push(0.5,0.5,0.5);
            colors.push(0.5,0.5,0.5);
        }

        var faces = [
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

        var model = {coords: coords, colors: colors, faces: faces};
        for (var i = 0; i < level; i++){
            model =  primitives.subdivideFaces(model);
        }

        model.normals = this.getNormals(model.coords,model.faces);

        return model;

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
