'use strict';

customElements.define('compodoc-menu', class extends HTMLElement {
    constructor() {
        super();
        this.isNormalMode = this.getAttribute('mode') === 'normal';
    }

    connectedCallback() {
        this.render(this.isNormalMode);
    }

    render(isNormalMode) {
        let tp = lithtml.html(`
        <nav>
            <ul class="list">
                <li class="title">
                    <a href="index.html" data-type="index-link">grow-logic documentation</a>
                </li>

                <li class="divider"></li>
                ${ isNormalMode ? `<div id="book-search-input" role="search"><input type="text" placeholder="Type to search"></div>` : '' }
                <li class="chapter">
                    <a data-type="chapter-link" href="index.html"><span class="icon ion-ios-home"></span>Getting started</a>
                    <ul class="links">
                                <li class="link">
                                    <a href="overview.html" data-type="chapter-link">
                                        <span class="icon ion-ios-keypad"></span>Overview
                                    </a>
                                </li>

                            <li class="link">
                                <a href="index.html" data-type="chapter-link">
                                    <span class="icon ion-ios-paper"></span>
                                        README
                                </a>
                            </li>
                        <li class="link">
                            <a href="license.html"  data-type="chapter-link">
                                <span class="icon ion-ios-paper"></span>LICENSE
                            </a>
                        </li>
                                <li class="link">
                                    <a href="dependencies.html" data-type="chapter-link">
                                        <span class="icon ion-ios-list"></span>Dependencies
                                    </a>
                                </li>
                                <li class="link">
                                    <a href="properties.html" data-type="chapter-link">
                                        <span class="icon ion-ios-apps"></span>Properties
                                    </a>
                                </li>

                    </ul>
                </li>
                    <li class="chapter additional">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#additional-pages"'
                            : 'data-bs-target="#xs-additional-pages"' }>
                            <span class="icon ion-ios-book"></span>
                            <span>Additional documentation</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="additional-pages"' : 'id="xs-additional-pages"' }>
                                    <li class="link ">
                                        <a href="additional-documentation/architecture.html" data-type="entity-link" data-context-id="additional">Architecture</a>
                                    </li>
                                    <li class="link ">
                                        <a href="additional-documentation/setup.html" data-type="entity-link" data-context-id="additional">Setup</a>
                                    </li>
                                    <li class="link ">
                                        <a href="additional-documentation/qualite.html" data-type="entity-link" data-context-id="additional">Qualite</a>
                                    </li>
                                    <li class="link ">
                                        <a href="additional-documentation/tests.html" data-type="entity-link" data-context-id="additional">Tests</a>
                                    </li>
                                    <li class="link ">
                                        <a href="additional-documentation/configuration.html" data-type="entity-link" data-context-id="additional">Configuration</a>
                                    </li>
                                    <li class="link ">
                                        <a href="additional-documentation/build-&amp;-packaging.html" data-type="entity-link" data-context-id="additional">Build &amp; Packaging</a>
                                    </li>
                                    <li class="link ">
                                        <a href="additional-documentation/cicd.html" data-type="entity-link" data-context-id="additional">CICD</a>
                                    </li>
                                    <li class="link ">
                                        <a href="additional-documentation/styles.html" data-type="entity-link" data-context-id="additional">Styles</a>
                                    </li>
                                    <li class="link ">
                                        <a href="additional-documentation/multi-langues.html" data-type="entity-link" data-context-id="additional">Multi Langues</a>
                                    </li>
                                    <li class="link ">
                                        <a href="additional-documentation/accessibilite.html" data-type="entity-link" data-context-id="additional">Accessibilite</a>
                                    </li>
                                    <li class="link ">
                                        <a href="additional-documentation/seo.html" data-type="entity-link" data-context-id="additional">SEO</a>
                                    </li>
                                    <li class="link ">
                                        <a href="additional-documentation/documentation.html" data-type="entity-link" data-context-id="additional">Documentation</a>
                                    </li>
                                    <li class="link ">
                                        <a href="additional-documentation/rules-references.html" data-type="entity-link" data-context-id="additional">Rules References</a>
                                    </li>
                                    <li class="link ">
                                        <a href="additional-documentation/faq-&amp;-erreurs.html" data-type="entity-link" data-context-id="additional">FAQ &amp; Erreurs</a>
                                    </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#components-links"' :
                            'data-bs-target="#xs-components-links"' }>
                            <span class="icon ion-md-cog"></span>
                            <span>Components</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="components-links"' : 'id="xs-components-links"' }>
                            <li class="link">
                                <a href="components/AdminLayoutComponent.html" data-type="entity-link" >AdminLayoutComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/AppComponent.html" data-type="entity-link" >AppComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/CloseButtonComponent.html" data-type="entity-link" >CloseButtonComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ContactViewComponent.html" data-type="entity-link" >ContactViewComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/DashboardComponent.html" data-type="entity-link" >DashboardComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/DynamicFormComponent.html" data-type="entity-link" >DynamicFormComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ErrorHandlerComponent.html" data-type="entity-link" >ErrorHandlerComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/GenericErrorComponent.html" data-type="entity-link" >GenericErrorComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/GenericInputComponent.html" data-type="entity-link" >GenericInputComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/HeaderNavComponent.html" data-type="entity-link" >HeaderNavComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/HomeViewComponent.html" data-type="entity-link" >HomeViewComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/LanguageToggleComponent.html" data-type="entity-link" >LanguageToggleComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/LoginViewComponent.html" data-type="entity-link" >LoginViewComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/LogoComponent.html" data-type="entity-link" >LogoComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/MainButtonComponent.html" data-type="entity-link" >MainButtonComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/MainFooterComponent.html" data-type="entity-link" >MainFooterComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/MainLinkComponent.html" data-type="entity-link" >MainLinkComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/PrivateComponent.html" data-type="entity-link" >PrivateComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/PublicLayoutComponent.html" data-type="entity-link" >PublicLayoutComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ScrollToTopComponent.html" data-type="entity-link" >ScrollToTopComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ServerErrorComponent.html" data-type="entity-link" >ServerErrorComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/SnackbarComponent.html" data-type="entity-link" >SnackbarComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/UnauthorizedErrorComponent.html" data-type="entity-link" >UnauthorizedErrorComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/UnfoundErrorComponent.html" data-type="entity-link" >UnfoundErrorComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/UnknownErrorComponent.html" data-type="entity-link" >UnknownErrorComponent</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#directives-links"' :
                                'data-bs-target="#xs-directives-links"' }>
                                <span class="icon ion-md-code-working"></span>
                                <span>Directives</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="directives-links"' : 'id="xs-directives-links"' }>
                                <li class="link">
                                    <a href="directives/InputFocusDirective.html" data-type="entity-link" >InputFocusDirective</a>
                                </li>
                                <li class="link">
                                    <a href="directives/InputTitleCaseDirective.html" data-type="entity-link" >InputTitleCaseDirective</a>
                                </li>
                                <li class="link">
                                    <a href="directives/InputTrimDirective.html" data-type="entity-link" >InputTrimDirective</a>
                                </li>
                                <li class="link">
                                    <a href="directives/InputUppercaseDirective.html" data-type="entity-link" >InputUppercaseDirective</a>
                                </li>
                                <li class="link">
                                    <a href="directives/TypeWriterDirective.html" data-type="entity-link" >TypeWriterDirective</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#classes-links"' :
                            'data-bs-target="#xs-classes-links"' }>
                            <span class="icon ion-ios-paper"></span>
                            <span>Classes</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="classes-links"' : 'id="xs-classes-links"' }>
                            <li class="link">
                                <a href="classes/CustomTranslateLoader.html" data-type="entity-link" >CustomTranslateLoader</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#injectables-links"' :
                                'data-bs-target="#xs-injectables-links"' }>
                                <span class="icon ion-md-arrow-round-down"></span>
                                <span>Injectables</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="injectables-links"' : 'id="xs-injectables-links"' }>
                                <li class="link">
                                    <a href="injectables/AdminService.html" data-type="entity-link" >AdminService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/AuthService.html" data-type="entity-link" >AuthService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/SeoService.html" data-type="entity-link" >SeoService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/SnackbarService.html" data-type="entity-link" >SnackbarService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/TranslationService.html" data-type="entity-link" >TranslationService</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#interfaces-links"' :
                            'data-bs-target="#xs-interfaces-links"' }>
                            <span class="icon ion-md-information-circle-outline"></span>
                            <span>Interfaces</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? ' id="interfaces-links"' : 'id="xs-interfaces-links"' }>
                            <li class="link">
                                <a href="interfaces/AuthResponse.html" data-type="entity-link" >AuthResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/FormFieldBehaviors.html" data-type="entity-link" >FormFieldBehaviors</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/FormFieldConfig.html" data-type="entity-link" >FormFieldConfig</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/HostingConfig.html" data-type="entity-link" >HostingConfig</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/HostLink.html" data-type="entity-link" >HostLink</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IEnvironment.html" data-type="entity-link" >IEnvironment</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/LoginCredentials.html" data-type="entity-link" >LoginCredentials</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/NavLink.html" data-type="entity-link" >NavLink</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SeoData.html" data-type="entity-link" >SeoData</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SnackbarData.html" data-type="entity-link" >SnackbarData</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SocialLink.html" data-type="entity-link" >SocialLink</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/User.html" data-type="entity-link" >User</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#pipes-links"' :
                                'data-bs-target="#xs-pipes-links"' }>
                                <span class="icon ion-md-add"></span>
                                <span>Pipes</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="pipes-links"' : 'id="xs-pipes-links"' }>
                                <li class="link">
                                    <a href="pipes/AlertPipe.html" data-type="entity-link" >AlertPipe</a>
                                </li>
                                <li class="link">
                                    <a href="pipes/DateFormatPipe.html" data-type="entity-link" >DateFormatPipe</a>
                                </li>
                                <li class="link">
                                    <a href="pipes/YesNoPipe.html" data-type="entity-link" >YesNoPipe</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#miscellaneous-links"'
                            : 'data-bs-target="#xs-miscellaneous-links"' }>
                            <span class="icon ion-ios-cube"></span>
                            <span>Miscellaneous</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="miscellaneous-links"' : 'id="xs-miscellaneous-links"' }>
                            <li class="link">
                                <a href="miscellaneous/functions.html" data-type="entity-link">Functions</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/typealiases.html" data-type="entity-link">Type aliases</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/variables.html" data-type="entity-link">Variables</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <a data-type="chapter-link" href="routes.html"><span class="icon ion-ios-git-branch"></span>Routes</a>
                        </li>
            </ul>
        </nav>
        `);
        this.innerHTML = tp.strings;
    }
});