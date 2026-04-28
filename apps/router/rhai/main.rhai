// Extract JWT claims from context and forward as headers to subgraphs.
// Apollo Router 2.x stores validated JWT claims at
// "apollo::authentication::jwt_claims" as a JSON object.
// The `headers.all.request.insert.from_context` directive only supports
// top-level context keys (no nested field access), so a Rhai script is required.
//
// Note: in subgraph_service, `request.headers` refers to the originating
// (supergraph) request headers and is READ-ONLY in v2.x. To mutate the
// outbound subgraph HTTP request, write to `request.subgraph.headers` —
// see https://www.apollographql.com/docs/router/customizations/rhai-api
fn subgraph_service(service, subgraph) {
    let request_callback = |request| {
        if request.context.contains("apollo::authentication::jwt_claims") {
            let claims = request.context["apollo::authentication::jwt_claims"];
            if claims != () {
                let sub = claims["sub"];
                if sub != () {
                    request.subgraph.headers["x-user-id"] = sub.to_string();
                }
                let role = claims["role"];
                if role != () {
                    request.subgraph.headers["x-user-role"] = role.to_string();
                }
            }
        }
    };
    service.map_request(request_callback);
}
