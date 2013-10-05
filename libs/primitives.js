var primitives = {

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
        return [vertArray[index],vertArray[index+1],vertArray[index+2]];
    },

    getNormals: function(vertices, faces){
        var count = 1;
        var normals = [];
        var a, b, c, normal;
        for(var j = 0; j<faces.length; j++){
            switch(count){
                case 1:
                    a = this.getCoords(vertices, j);
                    count++;
                    break;
                case 2:
                    b = this.getCoords(vertices, j);
                    count++;
                    break
                case 3:
                    c = this.getCoords(vertices, j);
                    normal = this.getNormal(a,b,c);
                    normals.push(normal[0],normal[1],normal[2]);
                    normals.push(normal[0],normal[1],normal[2]);
                    normals.push(normal[0],normal[1],normal[2]);
                    count = 1;
                    break;
            }
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

    triangle: function(lA,lB,angle, z){
        var x1, x2, y1, y2;
        var vertices = [];
        var colors = [];
        var faces = [];
        var normals = [];

        vertices.push(0,0,z);
        colors.push(0,0,0);

        x1 = Math.sin(LIBS.degToRad(0))*lA;
        y1 = Math.cos(LIBS.degToRad(0))*lA;
        vertices.push(x1,y1,z);
        colors.push(1,0,0);

        x2 = Math.sin(LIBS.degToRad(angle))*lB;
        y2 = Math.cos(LIBS.degToRad(angle))*lB;
        vertices.push(x2,y2,z);
        colors.push(0,0,1);

        faces.push(0,1,2);

        normals = this.getNormals(vertices, faces);

        return {vertices: vertices, colors: colors, faces: faces, normals: normals};
    },

    cone: function(radius, height, rate){
        var vertices = [];
        var colors = [];
        var faces = [];
        var normals = [];
        vertices.push(0,0,height/2);
        colors.push(0,0,1)
        var z = -1*height/2;
        for(var i = 0; i<rate; i++){
            var angle = LIBS.degToRad(360/rate*i);
            var x = Math.sin(angle)*radius;
            var y =  Math.cos(angle)*radius;
            //vertice coords
            vertices.push(x, y, z);
            //color for vertice
            colors.push(1, 0,0);
            faces.push(0, i+1,i<rate-1?i+2:1);
        }
        this.pushNormals(vertices, faces, normals);

        return {vertices: vertices, colors: colors, faces: faces, normals: normals};
    },

    cylinder: function(radius, height, rate){
        var vertices = [];
        var coords = [];
        var colors = [];
        var faces = [];
        var normals = [];

        for(var i = 0; i<rate; i++){
            var angle = LIBS.degToRad(360/rate*i);
            var x = Math.sin(angle)*radius;
            var y =  Math.cos(angle)*radius;
            var z = height/2;
            //vertice coords
            coords.push(x, y, z);
            colors.push(0, 0,1);

            coords.push(x, y, -1*z);
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
        var result = [];
        for(var j = 0; j<coords.length;j+=3){
            vertices.push(
                coords[j],coords[j+1],coords[j+2],
                colors[j],colors[j+1],colors[j+2],
                normals[j],normals[j+1],normals[j+2]
            );
        }

        return {vertices: vertices, faces: faces};
    },

    cylinders: function(rFactor, hFactor,rateFactor,count){
        var model;
        var radius = 1;
        var height = 1
        for(var i = 0; i<count; i++){
            radius += rFactor;
            height += hFactor;
            if(!model){
                model = this.cylinder(radius,height,rateFactor);
            }
            else{
                var facesLength = model.faces.length;
                var vertLength = model.vertices.length;
                var cylinder = this.cylinder(radius,height,rateFactor);

                for(var vi = 0; vi<cylinder.vertices.length; vi++){
                    model.vertices.push(cylinder.vertices[vi]);
                }

                for(var fi = 0; fi<cylinder.faces.length; fi++){
                    model.faces.push(cylinder.faces[fi]+facesLength/3);
                }
            }
        }
        return model;
    }
}